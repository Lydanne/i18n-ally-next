import { expect } from 'chai'

/**
 * 一键翻译核心逻辑的纯函数测试
 * 模拟收集缺失 key + 过期 key 并去重的逻辑
 */

interface SourceSnapshot {
  readonly text: string
  readonly time: string
}

interface TranslateNode {
  readonly locale: string
  readonly keypath: string
}

function collectTranslateNodes(
  targetLocales: string[],
  missingKeysByLocale: Record<string, string[]>,
  staleKeysByLocale: Record<string, string[]>,
): TranslateNode[] {
  const nodeSet = new Set<string>()
  const nodes: TranslateNode[] = []
  for (const locale of targetLocales) {
    const missingKeys = missingKeysByLocale[locale] || []
    for (const key of missingKeys) {
      const id = `${locale}::${key}`
      if (!nodeSet.has(id)) {
        nodeSet.add(id)
        nodes.push({ locale, keypath: key })
      }
    }
    const staleKeys = staleKeysByLocale[locale] || []
    for (const key of staleKeys) {
      const id = `${locale}::${key}`
      if (!nodeSet.has(id)) {
        nodeSet.add(id)
        nodes.push({ locale, keypath: key })
      }
    }
  }
  return nodes
}

function getStaleKeysForLocale(
  allKeys: string[],
  snapshots: Record<string, SourceSnapshot>,
  sourceValues: Record<string, string>,
  localeValues: Record<string, string>,
): string[] {
  const staleKeys: string[] = []
  for (const key of allKeys) {
    const snapshot = snapshots[key]
    if (!snapshot)
      continue
    const currentValue = sourceValues[key] || ''
    if (snapshot.text !== currentValue) {
      if (localeValues[key])
        staleKeys.push(key)
    }
  }
  return staleKeys
}

describe('commands', () => {
  describe('translateAllMissing', () => {
    it('should collect missing keys', () => {
      const result = collectTranslateNodes(
        ['de', 'fr'],
        { de: ['key.a', 'key.b'], fr: ['key.a'] },
        { de: [], fr: [] },
      )
      expect(result).to.have.length(3)
      expect(result).to.deep.include({ locale: 'de', keypath: 'key.a' })
      expect(result).to.deep.include({ locale: 'de', keypath: 'key.b' })
      expect(result).to.deep.include({ locale: 'fr', keypath: 'key.a' })
    })

    it('should collect stale keys', () => {
      const result = collectTranslateNodes(
        ['de'],
        { de: [] },
        { de: ['key.stale'] },
      )
      expect(result).to.have.length(1)
      expect(result[0]).to.eql({ locale: 'de', keypath: 'key.stale' })
    })

    it('should deduplicate keys that are both missing and stale', () => {
      const result = collectTranslateNodes(
        ['de'],
        { de: ['key.a'] },
        { de: ['key.a', 'key.b'] },
      )
      expect(result).to.have.length(2)
      expect(result).to.deep.include({ locale: 'de', keypath: 'key.a' })
      expect(result).to.deep.include({ locale: 'de', keypath: 'key.b' })
    })

    it('should return empty when no missing or stale keys', () => {
      const result = collectTranslateNodes(
        ['de', 'fr'],
        { de: [], fr: [] },
        { de: [], fr: [] },
      )
      expect(result).to.eql([])
    })

    it('should handle multiple locales independently', () => {
      const result = collectTranslateNodes(
        ['de', 'fr'],
        { de: ['key.a'], fr: ['key.b'] },
        { de: ['key.c'], fr: ['key.c'] },
      )
      expect(result).to.have.length(4)
    })
  })

  describe('getStaleKeysForLocale', () => {
    it('should detect stale keys for a locale', () => {
      const result = getStaleKeysForLocale(
        ['key.a', 'key.b'],
        {
          'key.a': { text: 'Old Hello', time: '2025-01-01T00:00:00Z' },
          'key.b': { text: 'World', time: '2025-01-01T00:00:00Z' },
        },
        { 'key.a': 'New Hello', 'key.b': 'World' },
        { 'key.a': 'Hallo', 'key.b': 'Welt' },
      )
      expect(result).to.eql(['key.a'])
    })

    it('should skip keys without existing translation in locale', () => {
      const result = getStaleKeysForLocale(
        ['key.a'],
        { 'key.a': { text: 'Old', time: '2025-01-01T00:00:00Z' } },
        { 'key.a': 'New' },
        {},
      )
      expect(result).to.eql([])
    })

    it('should skip keys without snapshots', () => {
      const result = getStaleKeysForLocale(
        ['key.a', 'key.b'],
        {},
        { 'key.a': 'Hello', 'key.b': 'World' },
        { 'key.a': 'Hallo', 'key.b': 'Welt' },
      )
      expect(result).to.eql([])
    })
  })
})
