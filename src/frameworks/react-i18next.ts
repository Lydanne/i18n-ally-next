import type { TextDocument } from 'vscode'
import type { ScopeRange } from './base'
import type { RewriteKeyContext, RewriteKeySource } from '~/core'
import type { LanguageId } from '~/utils'
import { Config } from '~/core'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, extractionsParsers } from '~/extraction'
import { Framework } from './base'

class ReactI18nextFramework extends Framework {
  id = 'react-i18next'
  display = 'React I18next'
  namespaceDelimiter = ':'

  // both `/` and `:` should work as delimiter, #425
  namespaceDelimiters = [':', '/']
  namespaceDelimitersRegex = /[:/]/g

  detection = {
    packageJSON: [
      'react-i18next',
      'next-i18next',
    ],
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
    '\\Wt\\(\\s*[\'"`]({key})[\'"`]',
    '\\Wi18nKey=[\'"`]({key})[\'"`]',
  ]

  supportAutoExtraction = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'html',
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
      )
    }
  }

  refactorTemplates(keypath: string) {
    return [
      `{t('${keypath}')}`,
      `t('${keypath}')`,
      `<Trans i18nKey="${keypath}"></Trans>`,
      keypath,
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    const delimiter = this.namespaceDelimiter
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

  // useTranslation
  // https://react.i18next.com/latest/usetranslation-hook#loading-namespaces
  getScopeRange(document: TextDocument): ScopeRange[] | undefined {
    if (!this.languageIds.includes(document.languageId as any))
      return

    const ranges: ScopeRange[] = []
    const text = document.getText()

    // Add smaller local scope overrides first
    // Namespaced prefixed keys already handled by rewriteKeys

    // t('foo', { ns: 'ns1' })
    const regT = /\Wt\([^)]*?ns:\s*['"`](\w+)['"`]/g

    for (const match of text.matchAll(regT)) {
      if (typeof match.index !== 'number')
        continue

      if (match[1]) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          namespace: match[1],
        })
      }
    }

    // <Trans i18nKey="foo" ns="ns1" />
    const regTrans = /\Wi18nKey=(?:(?!\/Trans>|\/>)[\s\S])*?ns=\s*['"`](.+?)['"`]/g

    for (const match of text.matchAll(regTrans)) {
      if (typeof match.index !== 'number')
        continue

      if (match[1]) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          namespace: match[1],
        })
      }
    }

    // Add first namespace as a global scope resetting on each occurrence
    // useTranslation(ns1) and useTranslation(['ns1', ...])
    const regUse = /useTranslation\(\s*(?:\[\s*)?['"`](.*?)['"`]/g
    let prevGlobalScope = false
    for (const match of text.matchAll(regUse)) {
      if (typeof match.index !== 'number')
        continue

      // end previous scope
      if (prevGlobalScope)
        ranges[ranges.length - 1].end = match.index

      // start a new scope if namespace is provided
      if (match[1]) {
        prevGlobalScope = true
        ranges.push({
          start: match.index,
          end: text.length,
          namespace: match[1],
        })
      }
    }

    return ranges
  }
}

export default ReactI18nextFramework
