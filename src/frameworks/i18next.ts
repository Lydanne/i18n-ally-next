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
    // 把其他 delimiter（/）统一转为主 delimiter（:），保留 namespace 信息
    const normalizedKey = key.split(this.namespaceDelimitersRegex).join(delimiter)

    // when explicitly set the namespace, ignore current namespace scope
    if (
      context.hasExplicitNamespace
      && context.namespace
      && normalizedKey.startsWith(context.namespace + delimiter)
    ) {
      return normalizedKey.slice(context.namespace.length + delimiter.length)
    }

    return normalizedKey
  }
}

export default I18nextFramework
