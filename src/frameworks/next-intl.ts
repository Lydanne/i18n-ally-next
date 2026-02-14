import type { TextDocument } from 'vscode'
import type { ScopeRange } from './base'
import type { KeyStyle, RewriteKeyContext, RewriteKeySource } from '~/core'
import type { LanguageId } from '~/utils'
import { Framework } from './base'

class NextIntlFramework extends Framework {
  id = 'next-intl'
  display = 'next-intl'
  namespaceDelimiter = '.'
  perferredKeystyle?: KeyStyle = 'nested'

  namespaceDelimiters = ['.']
  namespaceDelimitersRegex = /\./g

  detection = {
    packageJSON: [
      'next-intl',
    ],
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  usageMatchRegex = [
    // Basic usage
    '[^\\w\\d]t\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Rich text
    '[^\\w\\d]t\\s*\.rich\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Markup text
    '[^\\w\\d]t\\s*\.markup\\s*\\(\\s*[\'"`]({key})[\'"`]',

    // Raw text
    '[^\\w\\d]t\\s*\.raw\\s*\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    // Ideally we'd automatically consider the namespace here. Since this
    // doesn't seem to be possible though, we'll generate all permutations for
    // the `keypath`. E.g. `one.two.three` will generate `three`, `two.three`,
    // `one.two.three`.

    const keypaths = keypath.split('.').map((cur, index, parts) => {
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

    // Find matches of `useTranslations` and `getTranslations`. Later occurences will
    // override previous ones (this allows for multiple components with different
    // namespaces in the same file). Note that `getTranslations` can either be called
    // with a single string argument or an object with a `namespace` key.
    const regex = /(useTranslations\(\s*|getTranslations\(\s*|namespace:\s+)(['"`](.*?)['"`])?/g
    let prevGlobalScope = false
    for (const match of text.matchAll(regex)) {
      if (typeof match.index !== 'number')
        continue

      const namespace = match[3]

      // End previous scope
      if (prevGlobalScope)
        ranges[ranges.length - 1].end = match.index

      // Start a new scope if a namespace is provided
      if (namespace) {
        prevGlobalScope = true
        ranges.push({
          start: match.index,
          end: text.length,
          namespace,
        })
      }
    }

    return ranges
  }
}

export default NextIntlFramework
