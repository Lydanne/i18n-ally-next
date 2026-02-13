import type { Uri } from 'vscode'
import type { NodeOptions, PendingWrite } from '../types'
import { Range, workspace, WorkspaceEdit } from 'vscode'
import { File, Log } from '~/utils'
import { Config } from '../Config'
import { LocaleTree } from '../Nodes'
import { Loader } from './Loader'

const _fluent: typeof import('fluent-vue-cli') | undefined = (() => {
  // eslint-disable-next-line ts/no-require-imports
  try { return require('fluent-vue-cli') }
  catch { return undefined }
})()

export class FluentVueSfcLoader extends Loader {
  constructor(
    public readonly uri: Uri,
  ) {
    super(`[FluentVue SFC]${uri.fsPath}`)

    this.load()
  }

  get filepath() {
    return this.uri.fsPath
  }

  get files() {
    return []
  }

  async load() {
    const filepath = this.filepath
    Log.info(`📑 Loading fluent-vue sfc ${filepath}`)
    const doc = await workspace.openTextDocument(this.uri)
    if (!_fluent)
      throw new Error('fluent-vue-cli is not installed')
    const blocks = _fluent.getVueMessages(doc.getText())

    this.updateLocalesTree(blocks)
    this._onDidChange.fire(this.name)
  }

  private getOptions(locale: string): NodeOptions {
    return {
      filepath: this.uri.fsPath,
      locale: Config.normalizeLocale(locale),
      features: {
        FluentVueSfc: true,
      },
    }
  }

  _locales = new Set<string>()

  private updateLocalesTree(blocks: { locale: string, messages: Record<string, string> }[]) {
    this._flattenLocaleTree = {}
    this._locales = new Set()

    const tree = new LocaleTree({ keypath: '', features: { FluentVueSfc: true } })
    for (const section of blocks) {
      if (!section.messages)
        continue

      this._locales.add(Config.normalizeLocale(section.locale))
      this.updateTree(tree, section.messages, '', '', this.getOptions(section.locale))
    }

    this._localeTree = tree
  }

  get locales() {
    return Array.from(this._locales)
  }

  async write(pendings: PendingWrite | PendingWrite[]) {
    if (!Array.isArray(pendings))
      pendings = [pendings]

    pendings = pendings.filter(i => i)

    for (const pending of pendings) {
      const path = pending.textFromPath || pending.filepath
      if (!path)
        continue

      const doc = await workspace.openTextDocument(this.uri)
      const content = doc.getText()

      const newTranslation = { [pending.keypath]: pending.value! }

      if (!_fluent)
        throw new Error('fluent-vue-cli is not installed')
      const newContent = _fluent.mergeVue(content, pending.locale, newTranslation)

      if (doc.isDirty) {
        const edit = new WorkspaceEdit()
        edit.replace(this.uri, new Range(doc.positionAt(0), doc.positionAt(Infinity)), newContent)

        await workspace.applyEdit(edit)
      }
      else {
        await File.write(this.filepath, newContent)
      }

      await this.load()
    }
  }

  canHandleWrites(pending: PendingWrite) {
    return pending.filepath === this.filepath || pending.textFromPath === this.filepath
  }
}
