import type { KeyInDocument } from '~/core'
import type { LanguageId } from '~/utils'
import { parse } from '@babel/parser'
// @ts-ignore -- @babel/traverse has no bundled declarations in this project
import traverse from '@babel/traverse'
import { parseDocument } from 'htmlparser2'
import { Framework } from './base'

function isMessagesModule(source: string) {
  return /(?:^|\/)paraglide\/messages(?:\/index)?(?:\.[cm]?[jt]s)?$/.test(source)
}

function findCalls(text: string, offset = 0): KeyInDocument[] {
  const keys: KeyInDocument[] = []
  try {
    const ast = parse(text, { sourceType: 'unambiguous', plugins: ['jsx', 'typescript', 'decorators-legacy'], errorRecovery: true })
    traverse(ast, {
      CallExpression(path: any) {
        const callee = path.node.callee
        if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier')
          return
        const binding = path.scope.getBinding(callee.object.name)
        const specifier = binding?.path
        const declaration = specifier?.parentPath?.node
        if (declaration?.type !== 'ImportDeclaration' || !isMessagesModule(declaration.source.value))
          return
        if (specifier.node.type !== 'ImportNamespaceSpecifier'
          && !(specifier.node.type === 'ImportSpecifier' && specifier.node.imported.name === 'm')) {
          return
        }
        const property = callee.property
        const isIdentifier = !callee.computed && property.type === 'Identifier'
        const isString = callee.computed && property.type === 'StringLiteral'
        if ((!isIdentifier && !isString) || property.start == null || property.end == null)
          return
        const start = offset + property.start + (isString ? 1 : 0)
        const end = offset + property.end - (isString ? 1 : 0)
        keys.push({
          key: isString ? property.value : property.name,
          start,
          end,
          quoted: isString,
          fullMatchStart: offset + path.node.start,
          fullMatchEnd: offset + path.node.end,
        })
      },
    })
  }
  catch {
    // An incomplete or unsupported file must not yield speculative matches.
  }
  return keys
}

class ParaglideFramework extends Framework {
  id = 'paraglide'
  display = 'Paraglide.js'
  detection = { packageJSON: ['@inlang/paraglide-js', '@inlang/paraglide-sveltekit'] }
  languageIds: LanguageId[] = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'svelte', 'vue']
  preferredLocalePaths = ['messages']
  preferredKeystyle = 'flat' as const
  usageMatchRegex: string[] = []

  getDocumentKeyUsages(text: string, languageId?: string) {
    if (!languageId || !this.languageIds.includes(languageId as LanguageId))
      return []
    if (languageId !== 'svelte' && languageId !== 'vue')
      return findCalls(text)
    const keys: KeyInDocument[] = []
    const document = parseDocument(text, { withStartIndices: true, withEndIndices: true })
    for (const node of document.children) {
      if (node.type !== 'script' || node.startIndex == null || node.endIndex == null)
        continue
      const start = text.indexOf('>', node.startIndex) + 1
      const closing = text.lastIndexOf('</', node.endIndex)
      if (start > node.startIndex && closing >= start)
        keys.push(...findCalls(text.slice(start, closing), start))
    }
    return keys
  }

  // Extraction needs to preserve Paraglide's named arguments and is not yet supported.
  refactorTemplates() {
    return []
  }
}

export default ParaglideFramework
