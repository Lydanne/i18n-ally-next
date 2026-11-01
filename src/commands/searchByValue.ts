import type { QuickPickItem, TextDocument } from 'vscode'
import type { ValueSearchResult } from './searchByValueCore'
import type { KeyOccurrence } from '~/core'
import type { ExtensionModule } from '~/modules'
import path from 'path'
import { slash } from '@antfu/utils'
import { commands, Range, Selection, TextEditorRevealType, Uri, window, workspace } from 'vscode'
import { Commands } from '~/commands'
import { Analyst, Config, CurrentFile, Global, KeyDetector } from '~/core'
import i18n from '~/i18n'
import { Log } from '~/utils'
import { searchTranslationKeysByValue } from './searchByValueCore'
import { searchDecorations } from './searchDecorations'

const MAX_SEARCH_RESULTS = 200
const SEARCH_DEBOUNCE_MS = 150

export interface ValueSearchResultItem extends QuickPickItem {
  keypath: string
  locale: string
  value: string
  occurrence?: KeyOccurrence
  filepath?: string
}

function normalizeDisplayValue(value: string) {
  return value.replace(/\s+/g, ' ')
}

function getLocaleKeyRange(document: TextDocument, keypath: string) {
  const usages = KeyDetector.getUsages(document, CurrentFile.loader)
  const found = usages?.keys.find(key => KeyDetector.getKeypath(key.key, usages.namespace) === keypath)
  return found ? KeyDetector.getRange(document, found, true) : undefined
}

function createSearchResultItem(
  root: string,
  keypath: string,
  record: ValueSearchResult,
  occurrence?: KeyOccurrence,
): ValueSearchResultItem {
  const filepath = occurrence?.filepath || record.filepath
  let relativePath = filepath ? slash(path.relative(root, filepath)) : ''
  if (relativePath && !relativePath.startsWith('.'))
    relativePath = `./${relativePath}`

  return {
    label: `$(symbol-key) ${keypath}`,
    alwaysShow: true,
    description: `[${record.locale}] "${normalizeDisplayValue(record.value)}"`,
    detail: occurrence
      ? `📄 ${relativePath}:${occurrence.line || 1}`
      : `$(circle-slash) ${i18n.t('search.no_usages_defined_in', relativePath || i18n.t('search.locale_file'))}`,
    keypath,
    locale: record.locale,
    value: record.value,
    occurrence,
    filepath,
  }
}

async function revealSearchResult(
  item: ValueSearchResultItem,
  preserveFocus: boolean,
  preview: boolean,
  isCurrent: () => boolean,
) {
  const filepath = item.occurrence?.filepath || item.filepath
  if (!filepath)
    return false

  const document = await workspace.openTextDocument(Uri.file(filepath))
  const range = item.occurrence
    ? new Range(document.positionAt(item.occurrence.start), document.positionAt(item.occurrence.end))
    : getLocaleKeyRange(document, item.keypath)

  if (!range || !isCurrent())
    return false

  const editor = await window.showTextDocument(document, { preserveFocus, preview })
  if (!isCurrent())
    return false

  editor.selection = new Selection(range.end, range.start)
  editor.revealRange(range, TextEditorRevealType.InCenter)
  searchDecorations.replace(editor, [range])
  return true
}

export async function SearchByValue() {
  if (!Global.enabled)
    return

  const initialEditor = window.activeTextEditor
  const initialSelection = initialEditor?.selection
  const initialVisibleRange = initialEditor?.visibleRanges[0]
  const quickPick = window.createQuickPick<ValueSearchResultItem>()
  const baseTitle = i18n.t('command.search_by_value')
  quickPick.title = baseTitle
  quickPick.placeholder = i18n.t('prompt.search_by_value')
  quickPick.matchOnDescription = true
  quickPick.matchOnDetail = true

  let timer: NodeJS.Timeout | undefined
  let requestVersion = 0
  let previewVersion = 0
  let accepted = false
  let disposed = false

  async function updateResults(value: string, version: number) {
    if (!value.trim()) {
      if (version === requestVersion && !disposed) {
        quickPick.items = []
        quickPick.busy = false
        quickPick.title = baseTitle
      }
      return
    }

    quickPick.busy = true
    try {
      const root = Global.rootpath || ''
      const matches = searchTranslationKeysByValue(value, CurrentFile.loader)
      if (!matches.length) {
        if (version === requestVersion && !disposed) {
          quickPick.items = []
          quickPick.title = baseTitle
        }
        return
      }

      const occurrenceIndex = await Analyst.getOccurrenceIndex()
      if (version !== requestVersion || disposed)
        return

      const keyMap = new Map<string, ValueSearchResult[]>()
      for (const match of matches) {
        const records = keyMap.get(match.keypath)
        if (records)
          records.push(match)
        else
          keyMap.set(match.keypath, [match])
      }

      const groups = Array.from(keyMap, ([keypath, records]) => ({
        keypath,
        record: records.find(record => record.locale === Config.displayLanguage) || records[0],
        occurrences: occurrenceIndex.get(Analyst.normalizeKey(keypath)) || [],
      }))
      const totalResultCount = groups.reduce((total, group) => total + (group.occurrences.length || 1), 0)
      const items: ValueSearchResultItem[] = []

      for (const group of groups) {
        if (items.length >= MAX_SEARCH_RESULTS)
          break
        items.push(createSearchResultItem(root, group.keypath, group.record, group.occurrences[0]))
      }

      let occurrenceIndexInGroup = 1
      while (items.length < MAX_SEARCH_RESULTS) {
        let added = false
        for (const group of groups) {
          const occurrence = group.occurrences[occurrenceIndexInGroup]
          if (!occurrence)
            continue

          items.push(createSearchResultItem(root, group.keypath, group.record, occurrence))
          added = true
          if (items.length >= MAX_SEARCH_RESULTS)
            break
        }

        if (!added)
          break
        occurrenceIndexInGroup++
      }

      if (version !== requestVersion || disposed)
        return

      quickPick.items = items
      quickPick.title = totalResultCount > items.length
        ? `${baseTitle} — ${i18n.t('search.results_truncated', MAX_SEARCH_RESULTS)}`
        : baseTitle
    }
    catch (error) {
      Log.error(error)
      if (version === requestVersion && !disposed)
        quickPick.items = []
    }
    finally {
      if (version === requestVersion && !disposed)
        quickPick.busy = false
    }
  }

  quickPick.onDidChangeValue((value) => {
    if (timer)
      clearTimeout(timer)
    const version = ++requestVersion
    timer = setTimeout(() => void updateResults(value, version), SEARCH_DEBOUNCE_MS)
  })

  quickPick.onDidChangeActive((activeItems) => {
    const item = activeItems[0]
    if (!item)
      return

    const version = ++previewVersion
    void revealSearchResult(item, true, true, () => version === previewVersion && !disposed)
      .catch(error => Log.error(error))
  })

  quickPick.onDidAccept(async () => {
    const item = quickPick.selectedItems[0] || quickPick.activeItems[0]
    if (!item) {
      quickPick.hide()
      return
    }

    const version = ++previewVersion
    try {
      accepted = await revealSearchResult(item, false, false, () => version === previewVersion && !disposed)
    }
    catch (error) {
      Log.error(error)
      searchDecorations.clear()
    }
    if (!disposed)
      quickPick.hide()
  })

  quickPick.onDidHide(() => {
    disposed = true
    requestVersion++
    previewVersion++
    if (timer)
      clearTimeout(timer)
    if (!accepted) {
      searchDecorations.clear()
      if (initialEditor && initialSelection) {
        void window.showTextDocument(initialEditor.document, {
          preserveFocus: false,
          preview: true,
          viewColumn: initialEditor.viewColumn,
        }).then((editor) => {
          editor.selection = initialSelection
          if (initialVisibleRange)
            editor.revealRange(initialVisibleRange)
        }, error => Log.error(error))
      }
    }
    quickPick.dispose()
  })

  quickPick.show()
}

export default <ExtensionModule> function () {
  return [
    commands.registerCommand(Commands.search_by_value, SearchByValue),
  ]
}
