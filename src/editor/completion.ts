import type { CompletionItemProvider, Position, TextDocument } from 'vscode'
import type { Loader, LocaleNode, LocaleTree } from '~/core'
import type { ExtensionModule } from '~/modules'
import { CompletionItem, CompletionItemKind, languages } from 'vscode'
import { CurrentFile, Global, KeyDetector } from '~/core'
import { NodeHelper } from '~/utils/NodeHelper'

class CompletionProvider implements CompletionItemProvider {
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
  ) {
    if (!Global.enabled)
      return

    const loader: Loader = CurrentFile.loader
    const key = KeyDetector.getKey(document, position, true)

    if (key === undefined)
      return

    const scopedKey = KeyDetector.getScopedKey(document, position)

    if (!key) {
      return Object
        .values(CurrentFile.loader.keys)
        .map((key) => {
          let resolvedKey = key
          if (scopedKey) {
            resolvedKey = key.replace(`${scopedKey}.`, '')
          }
          const item = new CompletionItem(resolvedKey, CompletionItemKind.Text)
          item.detail = loader.getValueByKey(key)
          return item
        })
    }

    let parent = ''

    const parts = NodeHelper.splitKeypath(key)

    if (parts.length > 1) {
      const delimiter = Global.namespaceEnabled ? Global.getNamespaceDelimiter() : '.'
      // Check if the original key contains the namespace delimiter and it's the first part
      if (Global.namespaceEnabled && delimiter !== '.' && key.includes(delimiter)) {
        const delimiterIndex = key.indexOf(delimiter)
        const ns = key.slice(0, delimiterIndex)
        if (ns === parts[0]) {
          const restParts = parts.slice(1)
          if (restParts.length > 0) {
            parent = `${ns}${delimiter}${restParts.slice(0, -1).join('.')}`
          }
          else {
            parent = ns
          }
        }
        else {
          parent = parts.slice(0, -1).join('.')
        }
      }
      else {
        parent = parts.slice(0, -1).join('.')
      }
    }

    let node: LocaleTree | LocaleNode | undefined

    if (scopedKey && key)
      node = loader.getTreeNodeByKey([scopedKey, key].join('.'))

    if (!key)
      node = loader.root

    if (!node)
      node = loader.getTreeNodeByKey(key)

    if (!node && parent)
      node = loader.getTreeNodeByKey(parent)

    if (!node || node.type !== 'tree')
      return

    return Object
      .values(node.children)
      .map((child) => {
        const item = new CompletionItem(
          child.keyname,
          child.type === 'tree'
            ? CompletionItemKind.Field
            : CompletionItemKind.Text,
        )
        item.commitCharacters = ['.', ':']
        item.detail = child.type === 'node' ? child.getValue() : undefined
        return item
      })
  }
}

const m: ExtensionModule = () => {
  return languages.registerCompletionItemProvider(
    Global.getDocumentSelectors(),
    new CompletionProvider(),
    '.',
    '\'',
    '"',
    '`',
    ':',
  )
}

export default m
