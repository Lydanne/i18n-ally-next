import type { ExtensionContext, Location, Position, ProviderResult, Range, ReferenceProvider, RenameProvider, TextDocument, WorkspaceEdit } from 'vscode'
import type { ExtensionModule } from '~/modules'
import { languages, Range as VSCodeRange, window } from 'vscode'
import { Analyst, CurrentFile, KeyDetector } from '~/core'
import i18n from '~/i18n'
import { keypathValidate } from '~/utils'
import { Global } from '../core/Global'
import { findRenameTarget } from './renameTarget'

class Provider implements ReferenceProvider, RenameProvider {
  private getRenameTarget(document: TextDocument, position: Position) {
    const keys = KeyDetector.getKeys(document)
    const editor = window.activeTextEditor
    const selection = editor?.document.uri.toString() === document.uri.toString()
      ? editor.selection
      : undefined
    const target = findRenameTarget(
      keys,
      document.offsetAt(position),
      selection && !selection.isEmpty ? document.offsetAt(selection.start) : undefined,
      selection && !selection.isEmpty ? document.offsetAt(selection.end) : undefined,
    )
    if (!target)
      return undefined

    return {
      key: target.key,
      range: new VSCodeRange(
        document.positionAt(target.start),
        document.positionAt(target.end),
      ),
    }
  }

  async provideReferences(document: TextDocument, position: Position): Promise<Location[] | undefined> {
    if (!Global.enabled)
      return []

    const key = this.getRenameTarget(document, position)?.key

    if (!key)
      return []

    return await Analyst.getAllOccurrenceLocations(key)
  }

  prepareRename(document: TextDocument, position: Position): ProviderResult<Range | { range: Range, placeholder: string }> {
    if (!Global.enabled)
      return

    const result = this.getRenameTarget(document, position)
    if (!result)
      return
    const { key, range } = result
    return { range, placeholder: key }
  }

  async provideRenameEdits(document: TextDocument, position: Position, newName: string): Promise<WorkspaceEdit | undefined> {
    if (!Global.enabled)
      return

    const key = this.getRenameTarget(document, position)?.key

    if (!key)
      return

    if (!keypathValidate(newName))
      throw new Error(i18n.t('prompt.invalid_keypath'))

    if (newName !== key && CurrentFile.loader.getTreeNodeByKey(newName))
      throw new Error(i18n.t('prompt.key_already_exists'))

    return await Global.loader.renameKey(key, newName) // TODO:sfc
  }

  constructor(public readonly ctx: ExtensionContext) {}
}

const m: ExtensionModule = (ctx) => {
  const provider = new Provider(ctx)
  return [
    languages.registerReferenceProvider(Global.getDocumentSelectors(), provider),
    languages.registerRenameProvider(Global.getDocumentSelectors(), provider),
  ]
}

export default m
