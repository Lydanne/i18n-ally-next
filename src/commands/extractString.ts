import type { QuickPickItem, TextDocument } from 'vscode'
import type { DetectionResult } from '~/core'
import type { ExtensionModule } from '~/modules'
import { relative } from 'path'
import { trim } from 'lodash'
import { commands, Range, window } from 'vscode'
import { Config, CurrentFile, extractHardStrings, generateKeyFromText, Global, Telemetry, TelemetryKey } from '~/core'
import { parseHardString } from '~/extraction/parseHardString'
import i18n from '~/i18n'
import { keypathValidate, Log, promptTemplates } from '~/utils'
import { Commands } from './commands'

import { overrideConfirm } from './overrideConfirm'

interface QuickPickItemWithKey extends QuickPickItem {
  keypath: string
  type: 'tree' | 'node' | 'new' | 'existed'
}

export interface ExtractTextOptions {
  text: string
  rawText?: string
  args?: string[]
  range: Range
  isDynamic?: boolean
  document: TextDocument
  isInsert?: boolean
}

async function ExtractOrInsertCommnad(options?: ExtractTextOptions, detection?: DetectionResult) {
  Telemetry.track(TelemetryKey.ExtractString)

  if (Config.readonly) {
    Log.warn(i18n.t('errors.write_in_readonly_mode'), true)
    return
  }

  if (!options) {
    // execute from command palette, get from active document
    const editor = window.activeTextEditor
    const currentDoc = editor?.document
    if (!editor || !currentDoc)
      return

    let selRange: Range = editor.selection
    const selText = currentDoc.getText(editor.selection)
    const trimmed = trim(selText, '\'"` ')
    const quoteChars = `'"\``
    const charBefore = selRange.start.character > 0
      ? currentDoc.getText(new Range(selRange.start.translate(0, -1), selRange.start))
      : ''
    const charAfter = currentDoc.getText(new Range(selRange.end, selRange.end.translate(0, 1)))
    if (quoteChars.includes(charBefore) && charBefore === charAfter)
      selRange = new Range(selRange.start.translate(0, -1), selRange.end.translate(0, 1))

    options = {
      text: '',
      rawText: trimmed,
      range: selRange,
      document: currentDoc,
      isInsert: editor.selection.start.isEqual(editor.selection.end),
    }
  }

  const locale = Config.sourceLanguage
  const loader = CurrentFile.loader

  if (options.rawText && !options.text) {
    const result = parseHardString(options.rawText, options.document?.languageId, options.isDynamic)
    options.text = result?.text || ''
    options.args = result?.args
  }

  const { text, rawText, range, args, document, isInsert } = options
  const filepath = document.uri.fsPath

  const default_keypath = generateKeyFromText(rawText || text, filepath)

  const existingItems: QuickPickItemWithKey[]
    = isInsert
      ? []
      : loader.keys
          .map(key => ({
            description: loader.getValueByKey(key, Config.sourceLanguage, 0),
            keypath: key,
          }))
          .filter(item => item.description === text)
          .map(i => ({
            ...i,
            label: `$(replace-all) ${i.keypath}`,
            type: 'existed' as const,
            alwaysShow: true,
            detail: i18n.t('prompt.existing_translation'),
          }))

  const nsDelimiter = Global.namespaceEnabled ? Global.getNamespaceDelimiter() : undefined

  const getPickItems = (input?: string) => {
    let path: string | undefined
    if (input) {
      const nsIdx = nsDelimiter && nsDelimiter !== '.' ? input.indexOf(nsDelimiter) : -1
      if (nsIdx >= 0) {
        const ns = input.slice(0, nsIdx)
        const rest = input.slice(nsIdx + nsDelimiter!.length)
        const restParts = rest.split('.')
        if (restParts.length > 1) {
          path = `${ns}${nsDelimiter}${restParts.slice(0, -1).join('.')}`
        }
        else {
          path = ns
        }
      }
      else {
        const parts = input.split('.')
        path = parts.length > 1 ? parts.slice(0, -1).join('.') : undefined
      }
    }

    const node = path
      ? (loader.getTreeNodeByKey(path))
      : CurrentFile.loader.root

    let items: QuickPickItemWithKey[] = []
    if (node?.type === 'tree') {
      items = Object
        .values(node.children)
        .sort((a, b) => b.type.localeCompare(a.type))
        .map(i => ({
          label: `$(${i.type === 'tree' ? 'json' : 'symbol-parameter'}) ${i.keypath}`,
          description: loader.getValueByKey(i.keypath),
          type: i.type,
          keypath: i.keypath,
        }))
    }
    else if (node?.type === 'node') {
      items = [
        {
          label: `$(symbol-parameter) ${node.keypath}`,
          description: loader.getValueByKey(node.keypath),
          type: node.type,
          keypath: node.keypath,
        },
      ]
    }

    if (existingItems.length)
      items = [...existingItems, ...items]

    // create new item if value not exists
    const endsWithSeparator = input?.endsWith('.') || (nsDelimiter && input?.endsWith(nsDelimiter))
    if (!isInsert && input && !endsWithSeparator && !items.find(i => i.keypath === input)) {
      items.unshift({
        label: `$(add) ${input}`,
        description: i18n.t('prompt.create_new_path'),
        alwaysShow: true,
        keypath: input,
        type: 'new',
      })
    }

    return items
  }

  const extract = async (keypath: string, checkOverride = true) => {
    if (!keypath) {
      window.showWarningMessage(i18n.t('prompt.extraction_canceled'))
      return
    }
    if (!keypathValidate(keypath))
      return window.showWarningMessage(i18n.t('prompt.invalid_keypath'))

    const writeKeypath = CurrentFile.loader.rewriteKeys(keypath, 'write', { locale })

    let shouldOverride = 'skip'
    if (checkOverride) {
      shouldOverride = await overrideConfirm(writeKeypath, true, true)
      if (shouldOverride === 'retry') {
        commands.executeCommand(Commands.extract_text, options, detection)
        return
      }
      if (shouldOverride === 'canceled')
        return
    }

    const replacer = await promptTemplates(keypath, args, document, detection)

    if (!replacer) {
      window.showWarningMessage(i18n.t('prompt.extraction_canceled'))
      return
    }

    await extractHardStrings(document, [{
      range,
      replaceTo: replacer,
      keypath: shouldOverride === 'skip' ? undefined : writeKeypath,
      message: text,
      locale,
    }])
  }

  // create and init a QuickPick for the path
  const picker = window.createQuickPick<QuickPickItemWithKey>()
  picker.placeholder = i18n.t('prompt.enter_key_path', text)
  picker.ignoreFocusOut = true
  picker.canSelectMany = false
  picker.value = default_keypath
  picker.items = getPickItems(default_keypath)
  picker.matchOnDescription = true

  picker.onDidAccept(() => {
    const selection = picker.activeItems[0]
    if (!selection)
      return

    if (selection.type === 'new' || selection.type === 'node') {
      picker.dispose()
      extract(selection.keypath, !isInsert)
    }
    if (selection.type === 'existed') {
      picker.dispose()
      extract(selection.keypath, false)
    }
    else {
      const isNsNode = nsDelimiter && selection.keypath && !selection.keypath.includes(nsDelimiter) && !selection.keypath.includes('.')
      const sep = isNsNode ? nsDelimiter : '.'
      const value = `${selection.keypath}${sep}`
      picker.value = value
      picker.items = getPickItems(value)
      picker.show()
    }
  })

  picker.onDidChangeValue(() => {
    picker.items = getPickItems(picker.value)
    picker.show()
  })

  picker.onDidHide(() => picker.dispose())

  await picker.show()
}

function ExtractIngore(text: string, document?: TextDocument) {
  if (document) {
    const path = relative(Config.root, document.uri.fsPath)
    const obj = Config.extractIgnoredByFiles
    if (!obj[path])
      obj[path] = []
    obj[path].push(text)
    Config.extractIgnoredByFiles = obj
  }
  else {
    Config.extractIgnored = [...Config.extractIgnored, text]
  }

  CurrentFile.detectHardStrings(true)
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.extract_text, ExtractOrInsertCommnad),
    commands.registerCommand(Commands.extract_ignore, ExtractIngore),
    commands.registerCommand(Commands.extract_enable_auto_detect, () => {
      Config.extractAutoDetect = true
    }),
    commands.registerCommand(Commands.extract_disable_auto_detect, () => {
      Config.extractAutoDetect = false
    }),
  ]
}

export default m
