import type { CancellationToken, CodeLensProvider, ExtensionContext, TextDocument, Disposable as VSCodeDisposable } from 'vscode'
import type { ExtensionModule } from '~/modules'
import throttle from 'lodash/throttle'
import { CodeLens, Disposable, EventEmitter, languages, workspace } from 'vscode'
import { Commands } from '~/commands'
import { Analyst, Config, CurrentFile, Global, KeyDetector } from '~/core'
import i18n from '~/i18n'
import { THROTTLE_DELAY } from '../meta'

export class LocaleCodeLensProvider implements CodeLensProvider, VSCodeDisposable {
  private _onDidChangeCodeLenses = new EventEmitter<void>()
  private readonly disposables: VSCodeDisposable[] = []
  private readonly fireLoaderChange = throttle(() => this._onDidChangeCodeLenses.fire(), THROTTLE_DELAY)
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event

  constructor() {
    this.disposables.push(
      Analyst.onDidOccurrencesChanged(() => this._onDidChangeCodeLenses.fire()),
      CurrentFile.loader.onDidChange((source) => {
        if (source)
          this.fireLoaderChange()
      }),
      workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('i18n-ally-next.codeLens'))
          this._onDidChangeCodeLenses.fire()
      }),
    )
  }

  dispose() {
    this.fireLoaderChange.cancel()
    Disposable.from(...this.disposables).dispose()
    this._onDidChangeCodeLenses.dispose()
  }

  async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
    if (!Global.enabled || !Config.codeLens)
      return []

    const isLocaleFile = CurrentFile.loader.files.some(f => f?.filepath === document.uri.fsPath)
    if (!isLocaleFile)
      return []

    const usages = KeyDetector.getUsages(document, CurrentFile.loader)
    if (!usages || usages.type !== 'locale' || !usages.keys.length)
      return []

    const occurrenceIndex = await Analyst.getOccurrenceIndex()
    if (token.isCancellationRequested)
      return []

    const codeLenses: CodeLens[] = []

    for (const keyItem of usages.keys) {
      if (token.isCancellationRequested)
        return []

      const keypath = KeyDetector.getKeypath(keyItem.key, usages.namespace)
      const keyRange = KeyDetector.getRange(document, keyItem, true)
      const occurrences = occurrenceIndex.get(Analyst.normalizeKey(keypath)) || []
      const count = occurrences.length

      const title = count === 0
        ? `$(circle-slash) ${i18n.t('codelens.usages_zero')}`
        : count === 1
          ? `$(references) ${i18n.t('codelens.usages_one')}`
          : `$(references) ${i18n.t('codelens.usages_many', count)}`

      codeLenses.push(new CodeLens(keyRange.with(keyRange.start, keyRange.start), {
        title,
        command: count > 0 ? Commands.show_key_references : Commands.open_in_editor,
        arguments: count > 0
          ? [{ uri: document.uri, position: keyRange.start, keypath }]
          : [{ keypath }],
        tooltip: count > 0
          ? i18n.t('codelens.show_references', count, keypath)
          : i18n.t('codelens.no_references', keypath),
      }))
    }

    return codeLenses
  }
}

const codelens: ExtensionModule = (_ctx: ExtensionContext) => {
  const provider = new LocaleCodeLensProvider()
  return [
    provider,
    languages.registerCodeLensProvider(Global.getLocaleDocumentSelectors(), provider),
  ]
}

export default codelens
