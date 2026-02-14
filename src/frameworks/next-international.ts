import type { TextDocument } from 'vscode'
import type { ScopeRange } from './base'
import type { KeyStyle, RewriteKeyContext, RewriteKeySource } from '~/core'
import type { LanguageId } from '~/utils'
import { Config } from '~/core'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, extractionsParsers } from '~/extraction'
import { Framework } from './base'

class NextInternationalFramework extends Framework {
  id = 'next-international'
  display = 'next-international'
  namespaceDelimiter = '.'
  perferredKeystyle?: KeyStyle = 'flat'

  namespaceDelimiters = ['.']
  namespaceDelimitersRegex = /\./g

  detection = {
    packageJSON: [
      'next-international',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  supportAutoExtraction = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'html',
  ]

  usageMatchRegex = [
    // Basic usage
    '[^\\w\\d]t\\([\'"`]({key})[\'"`]',
    // Scoped usage
    '[^\\w\\d]scopedT\\([\'"`]({key})[\'"`]',
  ]

  detectHardStrings(doc: TextDocument) {
    const lang = doc.languageId
    const text = doc.getText()

    if (lang === 'html') {
      return extractionsParsers.html.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
        Config.extractParserHTMLOptions,
        // <script>
        script => extractionsParsers.babel.detect(
          script,
          DefaultExtractionRules,
          DefaultDynamicExtractionsRules,
          Config.extractParserBabelOptions,
        ),
      )
    }
    else {
      return extractionsParsers.babel.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
        {},
        (path, recordIgnore) => {
          const callee = path.get('callee')
          if (callee.node.name === 't' || callee.node.name === 'scopedT')
            recordIgnore(path)
        },
      )
    }
  }

  refactorTemplates(keypath: string) {
    const keypaths = keypath.split('.').map((_, index, parts) => {
      return parts.slice(parts.length - index - 1).join('.')
    })
    return [
      ...keypaths.map(cur =>
        `{t('${cur}')}`,
      ),
      ...keypaths.map(cur =>
        `t('${cur}')`,
      ),
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    const delimiter = this.namespaceDelimiter
    const normalizedKey = key.split(this.namespaceDelimitersRegex).join(delimiter)

    // When the namespace is explicitly set, ignore the current namespace scope
    if (
      context.hasExplicitNamespace
      && context.namespace
      && normalizedKey.startsWith(context.namespace + delimiter)
    ) {
      return normalizedKey.slice(context.namespace.length + delimiter.length)
    }

    return normalizedKey
  }

  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()

    const useScopedTRegex = /const scopedT = useScopedI18n\(\s*(['"`](.*?)['"`])?/g
    const namespaceMatchArray = [...text.matchAll(useScopedTRegex)]
    for (let i = 0; i < namespaceMatchArray.length; i++) {
      const currentNamespaceMatch = namespaceMatchArray[i]
      if (typeof currentNamespaceMatch.index !== 'number')
        continue

      const nextNamespaceMatch = namespaceMatchArray[i + 1]

      const scopedText = text.slice(currentNamespaceMatch.index, nextNamespaceMatch?.index)

      const namespace = currentNamespaceMatch[2]
      const scopedTRegex = /scopedT\(\s*['"`](.*?)['"`]/g
      for (const match of scopedText.matchAll(scopedTRegex)) {
        if (typeof match.index !== 'number')
          continue
        ranges.push({
          start: currentNamespaceMatch.index + match.index,
          end: currentNamespaceMatch.index + match.index + match[0].length,
          namespace,
        })
      }
    }

    return ranges
  }
}

export default NextInternationalFramework
