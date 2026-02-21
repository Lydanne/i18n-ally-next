import type { RewriteKeyContext, RewriteKeySource } from '~/core'
import type { LanguageId } from '~/utils'
import { Framework } from './base'

class I18nextFramework extends Framework {
  id = 'i18next'
  display = 'i18next'
  namespaceDelimiter = ':'

  // both `/` and `:` should work as delimiter, #425
  namespaceDelimiters = [':', '/']
  namespaceDelimitersRegex = /[:/]/g

  detection = {
    packageJSON: {
      any: [
        'i18next',
      ],
      none: [
        'react-i18next',
      ],
    },
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '(?:i18next|i18n|req)\\.t\\(\\s*[\'"`]({key})[\'"`]',
  ]

  enableFeatures = {
    namespace: true,
  }

  derivedKeyRules = [
    '{key}_plural',
    '{key}_0',
    '{key}_1',
    '{key}_2',
    '{key}_3',
    '{key}_4',
    '{key}_5',
    '{key}_6',
    '{key}_7',
    '{key}_8',
    '{key}_9',
    // support v4 format as well as v3
    '{key}_zero',
    '{key}_one',
    '{key}_two',
    '{key}_few',
    '{key}_many',
    '{key}_other',
  ]

  refactorTemplates(keypath: string) {
    return [
      keypath,
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    const delimiter = this.namespaceDelimiter
    // In i18next, `:` separates namespace from key, while `/` is a path separator
    // within the namespace itself (e.g. `pages/home:title` → ns=`pages/home`, key=`title`).
    // The tree stores namespace with `/` replaced by `.` (via getFileInfo), so we need to
    // convert `/` in the namespace part to `.` while keeping `:` as the ns-key delimiter.
    const colonIndex = key.indexOf(':')
    const slashIndex = key.indexOf('/')
    let normalizedKey: string
    if (colonIndex >= 0) {
      const nsPart = key.slice(0, colonIndex).replace(/\//g, '.')
      const keyPart = key.slice(colonIndex + 1)
      normalizedKey = nsPart + delimiter + keyPart
    }
    else if (slashIndex >= 0) {
      const lastSlash = key.lastIndexOf('/')
      const nsPart = key.slice(0, lastSlash).replace(/\//g, '.')
      const keyPart = key.slice(lastSlash + 1)
      normalizedKey = nsPart + delimiter + keyPart
    }
    else {
      normalizedKey = key
    }
    // when explicitly set the namespace, ignore current namespace scope
    if (
      context.hasExplicitNamespace
      && context.namespace
      && normalizedKey.startsWith(context.namespace + delimiter)
    ) {
      // If the explicit namespace in the key matches the scope namespace, we don't need to strip it.
      // Because `i18next` tree structures the keys with the namespace as the first part.
      // E.g. `errors:network.unauthorized` should be looked up as `errors` namespace and `network.unauthorized` key.
      // The tree keys are formatted with namespaceDelimiter, e.g. `errors:network.unauthorized`.
      // So we just return the normalizedKey.
    }
    return normalizedKey
  }
}

export default I18nextFramework
