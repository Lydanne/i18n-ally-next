import type { RewriteKeyContext, RewriteKeySource } from '../../../src/core/types'
import type { ScopeRange } from '../../../src/frameworks/base'
import { expect } from 'chai'

/**
 * 直接导入 ReactI18nextFramework 会触发 vscode 等依赖，
 * 这里手动构造一个最小化的实例来测试 rewriteKeys 和 getScopeRange。
 */

// ---- 辅助类型 ----
interface MinimalTextDocument {
  languageId: string
  getText: () => string
}

// ---- 构造最小化 framework 实例 ----
function createFramework() {
  const namespaceDelimiter = ':'
  const namespaceDelimiters = [':', '/']
  const languageIds = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'ejs']

  const rewriteKeys = (key: string, _source: RewriteKeySource, context: RewriteKeyContext = {}): string => {
    const delimiter = namespaceDelimiter
    const colonIndex = key.indexOf(':')
    const slashIndex = key.indexOf('/')
    let normalizedKey: string
    if (colonIndex >= 0) {
      const rawNsPart = key.slice(0, colonIndex)
      const nsPart = rawNsPart.replace(/\//g, '.')
      const keyPart = key.slice(colonIndex + 1)
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
      const lastSlash = key.lastIndexOf('/')
      const nsPart = key.slice(0, lastSlash).replace(/\//g, '.')
      const keyPart = key.slice(lastSlash + 1)
      normalizedKey = `${nsPart}${delimiter}${keyPart}`
    }
    else {
      normalizedKey = key
    }
    return normalizedKey
  }

  const getScopeRange = (document: MinimalTextDocument): ScopeRange[] | undefined => {
    if (!languageIds.includes(document.languageId))
      return undefined

    const ranges: ScopeRange[] = []
    const text = document.getText()

    // t('foo', { ns: 'ns1' })
    const regT = /\Wt\([^)]*?ns:\s*['"`]([^'"`]+)['"`]/g
    for (const match of Array.from(text.matchAll(regT))) {
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
    for (const match of Array.from(text.matchAll(regTrans))) {
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
    const regWithTranslation = /withTranslation\(\s*(?:\[\s*)?(?:['"`](.*?)['"`])?/g
    for (const match of Array.from(text.matchAll(regWithTranslation))) {
      if (typeof match.index !== 'number')
        continue
      if (match[1]) {
        ranges.push({
          start: 0,
          end: text.length,
          namespace: match[1],
        })
      }
    }

    // useTranslation() and useTranslation('ns1') and useTranslation(['ns1', ...])
    const regUse = /useTranslation\(\s*(?:\[\s*)?(?:['"`](.*?)['"`])?/g
    const regUsePrefix = /useTranslation\([^,]+,\s*\{[^}]*keyPrefix:\s*['"`](.*?)['"`]/g

    let currentGlobalScopeIndex = -1
    for (const match of Array.from(text.matchAll(regUse))) {
      if (typeof match.index !== 'number')
        continue
      if (currentGlobalScopeIndex !== -1)
        ranges[currentGlobalScopeIndex].end = match.index
      if (match[1]) {
        regUsePrefix.lastIndex = match.index
        const prefixMatch = regUsePrefix.exec(text)
        let namespace = match[1]
        if (prefixMatch && prefixMatch.index - match.index < 100)
          namespace += `.${prefixMatch[1]}`
        ranges.push({
          start: match.index,
          end: text.length,
          namespace,
        })
        currentGlobalScopeIndex = ranges.length - 1
      }
      else {
        currentGlobalScopeIndex = -1
      }
    }

    return ranges
  }

  return { rewriteKeys, getScopeRange, namespaceDelimiter, namespaceDelimiters }
}

function makeDoc(text: string, languageId = 'typescriptreact'): MinimalTextDocument {
  return { languageId, getText: () => text }
}

// ============================================================
// rewriteKeys 测试
// ============================================================
describe('react-i18next', () => {
  describe('rewriteKeys', () => {
    const { rewriteKeys } = createFramework()

    // ---- 基本场景：无 namespace ----
    it('普通 key 不含分隔符时原样返回', () => {
      expect(rewriteKeys('title', 'reference')).to.equal('title')
    })

    it('带 . 的普通 key 不含 namespace 分隔符时原样返回', () => {
      expect(rewriteKeys('description.part1', 'reference')).to.equal('description.part1')
    })

    // ---- 显式 namespace（含 :）----
    it('显式 namespace translation:title 保持不变', () => {
      const result = rewriteKeys('translation:title', 'reference', { hasExplicitNamespace: true })
      expect(result).to.equal('translation:title')
    })

    it('显式 namespace errors:network.unauthorized 保持不变', () => {
      const result = rewriteKeys('errors:network.unauthorized', 'reference', { hasExplicitNamespace: true })
      expect(result).to.equal('errors:network.unauthorized')
    })

    // ---- 路径型 namespace（含 /）----
    it('pages/home:title → pages.home:title（/ 转 .）', () => {
      const result = rewriteKeys('pages/home:title', 'reference', { hasExplicitNamespace: true })
      expect(result).to.equal('pages.home:title')
    })

    it('deep/nested/ns:key.path → deep.nested.ns:key.path', () => {
      const result = rewriteKeys('deep/nested/ns:key.path', 'reference', { hasExplicitNamespace: true })
      expect(result).to.equal('deep.nested.ns:key.path')
    })

    // ---- / 作为 namespace 分隔符（无 :）----
    it('pages/home/title → pages.home:title（最后一个 / 作为分隔符）', () => {
      expect(rewriteKeys('pages/home/title', 'reference')).to.equal('pages.home:title')
    })

    it('translation/title → translation:title', () => {
      expect(rewriteKeys('translation/title', 'reference')).to.equal('translation:title')
    })

    // ---- scope 拼接后的 ns.keyPrefix:key 格式 ----
    it('translation.foo:bar → translation:foo.bar（scope 拼接的 keyPrefix 格式）', () => {
      const result = rewriteKeys('translation.foo:bar', 'reference', { hasExplicitNamespace: false })
      expect(result).to.equal('translation:foo.bar')
    })

    it('translation.foo.deep:bar → translation:foo.deep.bar（多层 keyPrefix）', () => {
      const result = rewriteKeys('translation.foo.deep:bar', 'reference', { hasExplicitNamespace: false })
      expect(result).to.equal('translation:foo.deep.bar')
    })

    // ---- 路径型 namespace 经 scope 拼接（含 /）不应走 keyPrefix 逻辑 ----
    it('pages/home:title 非显式但含 / 时不走 keyPrefix 逻辑', () => {
      const result = rewriteKeys('pages/home:title', 'reference', { hasExplicitNamespace: false })
      expect(result).to.equal('pages.home:title')
    })

    // ---- 显式 namespace 含 . 时不走 keyPrefix 逻辑 ----
    it('pages.home:title 显式 namespace 时保持不变', () => {
      const result = rewriteKeys('pages.home:title', 'reference', { hasExplicitNamespace: true })
      expect(result).to.equal('pages.home:title')
    })
  })

  // ============================================================
  // getScopeRange 测试
  // ============================================================
  describe('getScopeRange', () => {
    const { getScopeRange } = createFramework()

    it('useTranslation("ns") 提取 namespace', () => {
      const doc = makeDoc([
        'const { t } = useTranslation(\'common\')',
        't(\'hello\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      expect(ranges).to.have.length(1)
      expect(ranges[0].namespace).to.equal('common')
    })

    it('useTranslation(["ns"]) 数组形式提取 namespace', () => {
      const doc = makeDoc([
        'const { t } = useTranslation([\'common\'])',
        't(\'hello\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      expect(ranges).to.have.length(1)
      expect(ranges[0].namespace).to.equal('common')
    })

    it('useTranslation("pages/home") 保留原始 namespace（含 /）', () => {
      const doc = makeDoc([
        'const { t } = useTranslation(\'pages/home\')',
        't(\'title\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      expect(ranges).to.have.length(1)
      expect(ranges[0].namespace).to.equal('pages/home')
    })

    it('useTranslation(["translation.foo"]) 保留原始 namespace（含 .）', () => {
      const doc = makeDoc([
        'const { t } = useTranslation([\'translation.foo\'])',
        't(\'bar\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      expect(ranges).to.have.length(1)
      expect(ranges[0].namespace).to.equal('translation.foo')
    })

    it('空 useTranslation() 重置 scope', () => {
      const doc = makeDoc([
        'const { t } = useTranslation(\'common\')',
        't(\'hello\')',
        'const { t: t2 } = useTranslation()',
        't2(\'world\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      const commonRange = ranges.find(r => r.namespace === 'common')
      expect(commonRange !== undefined).to.equal(true)
      // common scope 应该在 useTranslation() 处结束
      const useTransEmptyIndex = doc.getText().indexOf('useTranslation()')
      expect(commonRange!.end).to.equal(useTransEmptyIndex)
    })

    it('多个 useTranslation 依次覆盖 scope', () => {
      const doc = makeDoc([
        'const { t } = useTranslation(\'ns1\')',
        't(\'a\')',
        'const { t: t2 } = useTranslation(\'ns2\')',
        't2(\'b\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      const ns1Range = ranges.find(r => r.namespace === 'ns1')
      const ns2Range = ranges.find(r => r.namespace === 'ns2')
      expect(ns1Range !== undefined).to.equal(true)
      expect(ns2Range !== undefined).to.equal(true)
      // ns1 scope 应该在 ns2 的 useTranslation 处结束
      expect(ns1Range!.end).to.be.lessThan(ns2Range!.start + 50)
    })

    it('useTranslation("ns", { keyPrefix: "foo.bar" }) 拼接 keyPrefix', () => {
      const doc = makeDoc([
        'const { t } = useTranslation(\'translation\', { keyPrefix: \'foo.bar\' })',
        't(\'baz\')',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      expect(ranges).to.have.length(1)
      expect(ranges[0].namespace).to.equal('translation.foo.bar')
    })

    it('t("key", { ns: "override" }) 提取局部 namespace', () => {
      const doc = makeDoc([
        'const { t } = useTranslation(\'common\')',
        't(\'hello\', { ns: \'override\' })',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      const overrideRange = ranges.find(r => r.namespace === 'override')
      expect(overrideRange !== undefined).to.equal(true)
    })

    it('<Trans i18nKey="foo" ns="special" /> 提取 namespace', () => {
      const doc = makeDoc('<Trans i18nKey="foo" ns="special" />')
      const ranges = getScopeRange(doc)!
      const specialRange = ranges.find(r => r.namespace === 'special')
      expect(specialRange !== undefined).to.equal(true)
    })

    it('withTranslation("ns") 提取全局 namespace', () => {
      const doc = makeDoc([
        'function MyComponent({ t }) {',
        '  return t(\'hello\')',
        '}',
        'export default withTranslation(\'common\')(MyComponent)',
      ].join('\n'))
      const ranges = getScopeRange(doc)!
      const commonRange = ranges.find(r => r.namespace === 'common')
      expect(commonRange !== undefined).to.equal(true)
      expect(commonRange!.start).to.equal(0)
      expect(commonRange!.end).to.equal(doc.getText().length)
    })

    it('非支持语言返回 undefined', () => {
      const doc = makeDoc(
        'useTranslation("ns")',
        'python',
      )
      const ranges = getScopeRange(doc)
      expect(ranges).to.equal(undefined)
    })
  })

  // ============================================================
  // 端到端链路测试：模拟 Regex.ts 的拼接 + rewriteKeys
  // ============================================================
  describe('scope + rewriteKeys 端到端链路', () => {
    const { rewriteKeys, getScopeRange, namespaceDelimiter, namespaceDelimiters } = createFramework()

    /**
     * 模拟 Regex.ts handleRegexMatch 中的拼接逻辑
     */
    const simulateKeyResolution = (rawKey: string, scopeNamespace?: string): string => {
      const hasExplicitNamespace = namespaceDelimiters.some(d => rawKey.includes(d))
      let key = rawKey
      if (!hasExplicitNamespace && scopeNamespace)
        key = `${scopeNamespace}${namespaceDelimiter}${key}`
      return rewriteKeys(key, 'reference', {
        namespace: scopeNamespace,
        hasExplicitNamespace,
      })
    }

    it('useTranslation("pages/home") + t("title") → pages.home:title', () => {
      const doc = makeDoc('const { t } = useTranslation(\'pages/home\')\n t(\'title\')')
      const ranges = getScopeRange(doc)!
      const ns = ranges[0].namespace
      expect(simulateKeyResolution('title', ns)).to.equal('pages.home:title')
    })

    it('useTranslation("pages/home") + t("translation:title") → translation:title', () => {
      const doc = makeDoc('const { t } = useTranslation(\'pages/home\')\n t(\'translation:title\')')
      const ranges = getScopeRange(doc)!
      const ns = ranges[0].namespace
      expect(simulateKeyResolution('translation:title', ns)).to.equal('translation:title')
    })

    it('useTranslation(["translation.foo"]) + t("bar") → translation:foo.bar', () => {
      const doc = makeDoc('const { t } = useTranslation([\'translation.foo\'])\n t(\'bar\')')
      const ranges = getScopeRange(doc)!
      const ns = ranges[0].namespace
      expect(simulateKeyResolution('bar', ns)).to.equal('translation:foo.bar')
    })

    it('useTranslation(["translation.foo"]) + t("pages/home:title") → pages.home:title', () => {
      const doc = makeDoc('const { t } = useTranslation([\'translation.foo\'])\n t(\'pages/home:title\')')
      const ranges = getScopeRange(doc)!
      const ns = ranges[0].namespace
      expect(simulateKeyResolution('pages/home:title', ns)).to.equal('pages.home:title')
    })

    it('useTranslation(["translation.foo"]) + t("pages.home:title") → pages.home:title', () => {
      const doc = makeDoc('const { t } = useTranslation([\'translation.foo\'])\n t(\'pages.home:title\')')
      const ranges = getScopeRange(doc)!
      const ns = ranges[0].namespace
      expect(simulateKeyResolution('pages.home:title', ns)).to.equal('pages.home:title')
    })

    it('无 scope + t("title") → title', () => {
      expect(simulateKeyResolution('title', undefined)).to.equal('title')
    })

    it('无 scope + t("translation:title") → translation:title', () => {
      expect(simulateKeyResolution('translation:title', undefined)).to.equal('translation:title')
    })

    it('无 scope + t("pages/home:title") → pages.home:title', () => {
      expect(simulateKeyResolution('pages/home:title', undefined)).to.equal('pages.home:title')
    })

    it('useTranslation + keyPrefix: t("baz") → translation:foo.bar.baz', () => {
      const doc = makeDoc('const { t } = useTranslation(\'translation\', { keyPrefix: \'foo.bar\' })\n t(\'baz\')')
      const ranges = getScopeRange(doc)!
      const ns = ranges[0].namespace
      expect(simulateKeyResolution('baz', ns)).to.equal('translation:foo.bar.baz')
    })
  })
})
