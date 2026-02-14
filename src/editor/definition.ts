import type { Definition, DefinitionLink, Position, TextDocument } from 'vscode'
import type { ExtensionModule } from '~/modules'
import { languages, Location, Range, Uri, workspace } from 'vscode'
import { CurrentFile, Global, KeyDetector } from '~/core'
import { NodeHelper } from '~/utils'

class DefinitionProvider {
  async provideDefinition(document: TextDocument, position: Position): Promise<Definition | DefinitionLink[]> {
    const offset = document.offsetAt(position)
    const keys = KeyDetector.getKeys(document)
    const keyItem = keys.find(k => k.start <= offset && k.end >= offset)
    if (!keyItem)
      return []

    const key = keyItem.key
    const filepath = CurrentFile.loader.getFilepathByKey(key)
    if (!filepath)
      return []

    const localeDocument = await workspace.openTextDocument(filepath)
    if (!localeDocument)
      return []

    const parser = Global.getMatchedParser(filepath)
    if (!parser)
      return []

    const node = CurrentFile.loader.getNodeByKey(key)
    const keypath = NodeHelper.getPathWithoutNamespace(key, node)
    const range = parser.navigateToKey(localeDocument.getText(), keypath, await Global.requestKeyStyle())

    const { start = 0, end = 0 } = range || {}

    return new Location(
      Uri.file(filepath),
      new Range(
        localeDocument.positionAt(start),
        localeDocument.positionAt(end),
      ),
    )
  }
}

const definition: ExtensionModule = () => {
  return [
    languages.registerDefinitionProvider(
      Global.getDocumentSelectors(),
      new DefinitionProvider(),
    ),
  ]
}

export default definition
