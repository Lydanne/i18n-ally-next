import type { Uri } from 'vscode'
import type { NodeOptions, PendingWrite } from '../types'
import type { VueSfcMessageSection } from './vueSfcMessages'
import { Range, workspace, WorkspaceEdit } from 'vscode'
import { applyPendingToObject, File, Log, unflatten } from '~/utils'
import { Config } from '../Config'
import { Global } from '../Global'
import { LocaleTree } from '../Nodes'
import { Loader } from './Loader'
import { parseVueSfcMessages, renderVueSfcMessages } from './vueSfcMessages'

export class VueSfcLoader extends Loader {
  constructor(
    public readonly uri: Uri,
  ) {
    super(`[SFC]${uri.fsPath}`)

    this.load()
  }

  _parsedSections: VueSfcMessageSection[] = []
  _loaded = false

  get filepath() {
    return this.uri.fsPath
  }

  get files() {
    return []
  }

  async load() {
    const filepath = this.filepath
    Log.info(`📑 Loading sfc ${filepath}`)
    const doc = await workspace.openTextDocument(this.uri)
    this._parsedSections = parseVueSfcMessages(doc.getText(), filepath)
    this._loaded = true

    this.updateLocalesTree()
    this._onDidChange.fire(this.name)
  }

  private getOptions(_section: VueSfcMessageSection, locale: string, index: number): NodeOptions {
    return {
      filepath: this.uri.fsPath,
      locale: Config.normalizeLocale(locale),
      features: {
        VueSfc: true,
      },
      meta: {
        VueSfcSectionIndex: index,
        VueSfcLocale: locale,
      },
    }
  }

  _locales = new Set<string>()

  private updateLocalesTree() {
    this._flattenLocaleTree = {}
    this._locales = new Set()

    const tree = new LocaleTree({ keypath: '', features: { VueSfc: true } })
    for (const [index, section] of this._parsedSections.entries()) {
      if (!section.messages)
        continue
      const messages = unflatten(section.messages)
      for (const [locale, value] of Object.entries(messages)) {
        this._locales.add(Config.normalizeLocale(locale))
        this.updateTree(tree, value, '', '', this.getOptions(section, locale, index))
      }
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

    if (!this._loaded)
      return

    const doc = await workspace.openTextDocument(this.uri)
    const version = doc.version
    const source = doc.getText()
    const sections = parseVueSfcMessages(source, this.filepath)
    const changed = new Set<VueSfcMessageSection>()

    for (const pending of pendings) {
      const record = this.getRecordByKey(pending.keypath, pending.locale, true)
      if (!record)
        continue

      const sectionIndex = record.meta ? (record.meta.VueSfcSectionIndex || 0) : 0

      const section = sections[sectionIndex]
      const previous = this._parsedSections[sectionIndex]
      if (!section || !previous || section.lang !== previous.lang || section.locale !== previous.locale || section.originalContent !== previous.originalContent)
        throw new Error(`The i18n block in ${this.filepath} changed; reload it before writing`)

      const locale = record?.meta?.VueSfcLocale || pending.locale

      section.messages[locale] = applyPendingToObject(
        section.messages[locale] || {},
        pending.keypath,
        pending.value,
        await Global.requestKeyStyle(),
      )
      changed.add(section)
    }

    if (!changed.size)
      return
    if (doc.version !== version)
      throw new Error(`The document ${this.filepath} changed while translations were being written`)
    const content = renderVueSfcMessages(source, [...changed])

    if (doc.isDirty) {
      const edit = new WorkspaceEdit()
      edit.replace(this.uri, new Range(doc.positionAt(0), doc.positionAt(Infinity)), content)

      if (!await workspace.applyEdit(edit))
        throw new Error(`Could not update the document ${this.filepath}`)
    }
    else {
      await File.write(this.filepath, content)
    }

    await this.load()
  }

  canHandleWrites(pending: PendingWrite) {
    return this._loaded && pending.filepath === this.filepath
  }
}
