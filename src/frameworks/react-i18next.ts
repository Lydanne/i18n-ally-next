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
    // In react-i18next, `:` separates namespace from key, while `/` is a path separator
    // within the namespace itself (e.g. `pages/home:title` → ns=`pages/home`, key=`title`).
    // The tree stores namespace with `/` replaced by `.` (via getFileInfo), so we need to
    // convert `/` in the namespace part to `.` while keeping `:` as the ns-key delimiter.
    const colonIndex = key.indexOf(':')
    const slashIndex = key.indexOf('/')
    let normalizedKey: string
    if (colonIndex >= 0) {
      const rawNsPart = key.slice(0, colonIndex)
      const nsPart = rawNsPart.replace(/\//g, '.')
      const keyPart = key.slice(colonIndex + 1)
      // When the `:` was injected by scope prefixing (not from user code),
      // and the original nsPart contains `.` (not converted from `/`),
      // it is `ns.keyPrefix` format (e.g. `translation.foo` from useTranslation(['translation.foo'])).
      // Convert `translation.foo:bar` → `translation:foo.bar`
      const isKeyPrefixStyle = !context.hasExplicitNamespace
        && !rawNsPart.includes('/')
        && nsPart.includes('.')
      if (isKeyPrefixStyle) {
        const dotIndex = nsPart.indexOf('.')
        const realNs = nsPart.slice(0, dotIndex)
        const keyPrefix = nsPart.slice(dotIndex + 1)
        normalizedKey = `${realNs}${delimiter}${keyPrefix}.${keyPart}`
      }
      else {
        normalizedKey = `${nsPart}${delimiter}${keyPart}`
      }
    }
    else if (slashIndex >= 0) {
      // `pages/home/title` → treat last `/` as ns-key separator (alternative delimiter)
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
      // In i18next/react-i18next, when explicitly specifying namespace that matches defaultNamespace,
      // we shouldn't strip it because the key in the locale tree still has the namespace as root
      // if `namespace` is enabled in config.
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
    const regT = /\Wt\([^)]*?ns:\s*['"`]([^'"`]+)['"`]/g

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
    const regTrans = /\Wi18nKey=(?:(?!\/Trans>|\/>)[\s\S])*?ns=\s*['"`]([^'"`]+)['"`]/g

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

    // withTranslation('ns')
    // Note: withTranslation doesn't reset the scope like useTranslation, it only applies to the wrapped component
    const regWithTranslation = /withTranslation\(\s*(?:\[\s*)?(?:['"`](.*?)['"`])?/g
    for (const match of text.matchAll(regWithTranslation)) {
      if (typeof match.index !== 'number')
        continue

      if (match[1]) {
        // HOC usually wraps the component at the end of the file, so we apply it to the whole file
        // Or we could apply it from 0 to text.length
        ranges.push({
          start: 0,
          end: text.length,
          namespace: match[1],
        })
      }
    }

    // Add first namespace as a global scope resetting on each occurrence
    // useTranslation() and useTranslation('ns1') and useTranslation(['ns1', ...])
    const regUse = /useTranslation\(\s*(?:\[\s*)?(?:['"`](.*?)['"`])?/g

    // Check for keyPrefix in the second argument of useTranslation
    // e.g. useTranslation('ns', { keyPrefix: 'foo.bar' })
    const regUsePrefix = /useTranslation\([^,]+,\s*\{[^}]*keyPrefix:\s*['"`](.*?)['"`]/g

    let currentGlobalScopeIndex = -1
    for (const match of text.matchAll(regUse)) {
      if (typeof match.index !== 'number')
        continue

      // end previous scope
      if (currentGlobalScopeIndex !== -1)
        ranges[currentGlobalScopeIndex].end = match.index

      // start a new scope if namespace is provided
      if (match[1]) {
        // Find if this specific useTranslation has a keyPrefix
        regUsePrefix.lastIndex = match.index
        const prefixMatch = regUsePrefix.exec(text)
        let namespace = match[1]
        // If keyPrefix exists and is close enough to the match index, append it to the namespace
        if (prefixMatch && prefixMatch.index - match.index < 100) {
          namespace += this.namespaceDelimiter + prefixMatch[1]
        }
        ranges.push({
          start: match.index,
          end: text.length,
          namespace,
        })
        currentGlobalScopeIndex = ranges.length - 1
      }
      else {
        // If it's an empty useTranslation(), it resets the scope, we just ended the previous one
        currentGlobalScopeIndex = -1
      }
    }

    return ranges
  }
}

export default ReactI18nextFramework
