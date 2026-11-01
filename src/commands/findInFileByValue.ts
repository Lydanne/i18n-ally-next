import type { QuickPickItem, Range } from 'vscode'
import type { ExtensionModule } from '~/modules'
import path from 'path'
import { uniq } from 'lodash'
import { commands, Selection, TextEditorRevealType, window, workspace } from 'vscode'
import { Commands } from '~/commands'
import { Config, CurrentFile, Global, KeyDetector } from '~/core'
import i18n from '~/i18n'
import { searchDecorations } from './searchDecorations'

interface FileQuickPickItem extends QuickPickItem {
  keypath: string
  value?: string
  locale?: string
  range: Range
  line: number
}

export function clearFileSearchDecorations() {
  searchDecorations.clear()
}

export async function FindInFileByValue() {
  if (!Global.enabled) {
    window.showWarningMessage(i18n.t('prompt.no_locale_loaded'))
    return
  }

  let editor = window.activeTextEditor?.document.uri.scheme === 'file'
    ? window.activeTextEditor
    : window.visibleTextEditors.find(candidate => candidate.document.uri.scheme === 'file')

  if (!editor && CurrentFile._currentUri) {
    try {
      const document = await workspace.openTextDocument(CurrentFile._currentUri)
      editor = await window.showTextDocument(document)
    }
    catch {}
  }

  if (!editor) {
    window.showWarningMessage(i18n.t('prompt.open_file_before_search'))
    return
  }

  const targetEditor = editor
  const document = targetEditor.document
  const initialSelection = targetEditor.selection
  const initialVisibleRange = targetEditor.visibleRanges[0]
  const usages = KeyDetector.getUsages(document, CurrentFile.loader)
  let rawKeys = usages?.keys
  if (!rawKeys?.length)
    rawKeys = KeyDetector.getKeys(document)

  if (!rawKeys.length) {
    window.showInformationMessage(i18n.t('prompt.no_keys_in_document'))
    clearFileSearchDecorations()
    return
  }

  const loader = CurrentFile.loader
  const filename = path.basename(document.fileName)
  const useKeyRange = usages?.type === 'locale'
  const allFileKeys = rawKeys.map((key) => {
    const range = KeyDetector.getRange(document, key, useKeyRange)
    return {
      keypath: KeyDetector.getKeypath(key.key, usages?.namespace),
      range,
      line: range.start.line + 1,
    }
  })

  const quickPick = window.createQuickPick<FileQuickPickItem>()
  quickPick.title = `${i18n.t('command.find_in_file_by_value')} — ${filename}`
  quickPick.placeholder = i18n.t('prompt.find_in_file_by_value')
  quickPick.matchOnDescription = true
  quickPick.matchOnDetail = true

  let accepted = false
  let matchingRanges: Range[] = []

  function getItemsForQuery(query: string): FileQuickPickItem[] {
    const normalizedQuery = query.toLowerCase().trim()
    const displayLanguage = Config.displayLanguage
    const localesToCheck = uniq([displayLanguage, ...Global.visibleLocales, ...loader.locales])
    const items: FileQuickPickItem[] = []

    for (const item of allFileKeys) {
      let matchedValue: string | undefined
      let matchedLocale: string | undefined

      if (!normalizedQuery) {
        matchedValue = loader.getValueByKey(item.keypath, displayLanguage)
        matchedLocale = displayLanguage
      }
      else {
        for (const locale of localesToCheck) {
          const value = loader.getValueByKey(item.keypath, locale)
          if (typeof value === 'string' && value.toLowerCase().includes(normalizedQuery)) {
            matchedValue = value
            matchedLocale = locale
            break
          }
        }
      }

      if (matchedValue !== undefined || !normalizedQuery) {
        items.push({
          label: `$(symbol-key) ${item.keypath}`,
          alwaysShow: true,
          description: matchedValue ? `[${matchedLocale}] "${matchedValue.replace(/\s+/g, ' ')}"` : '',
          detail: i18n.t('search.line', item.line),
          keypath: item.keypath,
          value: matchedValue,
          locale: matchedLocale,
          range: item.range,
          line: item.line,
        })
      }
    }

    matchingRanges = normalizedQuery ? items.map(item => item.range) : []
    searchDecorations.replaceMatches(targetEditor, matchingRanges)
    return items
  }

  quickPick.items = getItemsForQuery('')
  quickPick.onDidChangeValue((value) => {
    quickPick.items = getItemsForQuery(value)
  })

  quickPick.onDidChangeActive((activeItems) => {
    const item = activeItems[0]
    if (item && quickPick.value.trim() && searchDecorations.has(targetEditor, item.range)) {
      targetEditor.revealRange(item.range, TextEditorRevealType.InCenter)
      searchDecorations.replaceMatches(targetEditor, matchingRanges, item.range)
    }
  })

  quickPick.onDidAccept(async () => {
    const item = quickPick.selectedItems[0] || quickPick.activeItems[0]
    if (item) {
      const textEditor = await window.showTextDocument(targetEditor.document, {
        viewColumn: targetEditor.viewColumn,
        preserveFocus: false,
      })
      textEditor.selection = new Selection(item.range.end, item.range.start)
      textEditor.revealRange(item.range, TextEditorRevealType.InCenter)
      searchDecorations.replace(textEditor, [item.range])
      accepted = true
    }
    quickPick.hide()
  })

  quickPick.onDidHide(() => {
    if (!accepted) {
      searchDecorations.clear()
      targetEditor.selection = initialSelection
      if (initialVisibleRange)
        targetEditor.revealRange(initialVisibleRange)
    }
    quickPick.dispose()
  })

  quickPick.show()
}

export default <ExtensionModule> function () {
  return [
    commands.registerCommand(Commands.find_in_file_by_value, FindInFileByValue),
  ]
}
