import { expect } from 'chai'

/**
 * 过期检测核心逻辑的纯函数测试
 * 模拟 detectStaleEntries 的核心对比逻辑
 */

interface SourceSnapshot {
  readonly text: string
  readonly time: string
}

interface StaleEntry {
  readonly keypath: string
  readonly oldSourceText: string
  readonly newSourceText: string
}

function detectStaleFromData(
  allKeys: string[],
  snapshots: Record<string, SourceSnapshot>,
  currentValues: Record<string, string>,
): StaleEntry[] {
  const staleEntries: StaleEntry[] = []
  for (const key of allKeys) {
    const snapshot = snapshots[key]
    if (!snapshot)
      continue
    const currentValue = currentValues[key] || ''
    if (snapshot.text !== currentValue) {
      staleEntries.push({
        keypath: key,
        oldSourceText: snapshot.text,
        newSourceText: currentValue,
      })
    }
  }
  return staleEntries
}

describe('commands', () => {
  describe('staleDetection', () => {
    it('should return empty when no snapshots exist', () => {
      const result = detectStaleFromData(
        ['key.a', 'key.b'],
        {},
        { 'key.a': 'Hello', 'key.b': 'World' },
      )
      expect(result).to.eql([])
    })

    it('should return empty when all snapshots match current values', () => {
      const result = detectStaleFromData(
        ['key.a', 'key.b'],
        {
          'key.a': { text: 'Hello', time: '2025-01-01T00:00:00Z' },
          'key.b': { text: 'World', time: '2025-01-01T00:00:00Z' },
        },
        { 'key.a': 'Hello', 'key.b': 'World' },
      )
      expect(result).to.eql([])
    })

    it('should detect stale keys when source text changed', () => {
      const result = detectStaleFromData(
        ['key.a', 'key.b', 'key.c'],
        {
          'key.a': { text: 'Hello', time: '2025-01-01T00:00:00Z' },
          'key.b': { text: 'World', time: '2025-01-01T00:00:00Z' },
          'key.c': { text: 'Foo', time: '2025-01-01T00:00:00Z' },
        },
        { 'key.a': 'Hello Updated', 'key.b': 'World', 'key.c': 'Bar' },
      )
      expect(result).to.have.length(2)
      expect(result[0]).to.eql({
        keypath: 'key.a',
        oldSourceText: 'Hello',
        newSourceText: 'Hello Updated',
      })
      expect(result[1]).to.eql({
        keypath: 'key.c',
        oldSourceText: 'Foo',
        newSourceText: 'Bar',
      })
    })

    it('should detect stale when current value is empty', () => {
      const result = detectStaleFromData(
        ['key.a'],
        {
          'key.a': { text: 'Hello', time: '2025-01-01T00:00:00Z' },
        },
        { 'key.a': '' },
      )
      expect(result).to.have.length(1)
      expect(result[0].newSourceText).to.equal('')
    })

    it('should only check keys that have snapshots', () => {
      const result = detectStaleFromData(
        ['key.a', 'key.b', 'key.new'],
        {
          'key.a': { text: 'Hello', time: '2025-01-01T00:00:00Z' },
        },
        { 'key.a': 'Hello Changed', 'key.b': 'World', 'key.new': 'New' },
      )
      expect(result).to.have.length(1)
      expect(result[0].keypath).to.equal('key.a')
    })
  })
})
