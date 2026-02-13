import { expect } from 'chai'

/**
 * Editor LLM 翻译引擎纯函数测试
 * 测试 IDE 环境检测、vendor 映射、批量响应解析等核心逻辑
 */

type IDEType = 'cursor' | 'windsurf' | 'vscode'

// 复制纯函数逻辑用于测试（避免依赖 vscode 模块）
function detectIDEType(appName: string): IDEType {
  const name = appName.toLowerCase()
  if (name.includes('cursor'))
    return 'cursor'
  if (name.includes('windsurf'))
    return 'windsurf'
  return 'vscode'
}

function getVendorByIDE(ide: IDEType): string | undefined {
  switch (ide) {
    case 'cursor':
      return 'copilot'
    case 'windsurf':
      return 'copilot'
    case 'vscode':
      return 'copilot'
  }
}

function parseBatchResponse(
  raw: string,
  items: { readonly key: string, readonly text: string }[],
): Record<string, string> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch)
      throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>
    return parsed
  }
  catch {
    const result: Record<string, string> = {}
    const lines = raw.split('\n').filter(l => l.trim())
    items.forEach((item, idx) => {
      if (idx < lines.length)
        result[item.key] = lines[idx].replace(/^["']|["']$/g, '').trim()
    })
    return result
  }
}

describe('editorLLM', () => {
  describe('detectIDEType', () => {
    it('should detect Cursor', () => {
      expect(detectIDEType('Cursor')).to.equal('cursor')
      expect(detectIDEType('Cursor Editor')).to.equal('cursor')
      expect(detectIDEType('cursor')).to.equal('cursor')
    })

    it('should detect Windsurf', () => {
      expect(detectIDEType('Windsurf')).to.equal('windsurf')
      expect(detectIDEType('Windsurf Editor')).to.equal('windsurf')
      expect(detectIDEType('windsurf')).to.equal('windsurf')
    })

    it('should detect VSCode', () => {
      expect(detectIDEType('Visual Studio Code')).to.equal('vscode')
      expect(detectIDEType('VS Code')).to.equal('vscode')
      expect(detectIDEType('Code - OSS')).to.equal('vscode')
    })

    it('should fallback to vscode for unknown editors', () => {
      expect(detectIDEType('Unknown Editor')).to.equal('vscode')
      expect(detectIDEType('')).to.equal('vscode')
    })
  })

  describe('getVendorByIDE', () => {
    it('should return copilot for all IDE types', () => {
      expect(getVendorByIDE('cursor')).to.equal('copilot')
      expect(getVendorByIDE('windsurf')).to.equal('copilot')
      expect(getVendorByIDE('vscode')).to.equal('copilot')
    })
  })

  describe('parseBatchResponse', () => {
    const items = [
      { key: 'hello', text: 'Hello' },
      { key: 'world', text: 'World' },
      { key: 'greeting', text: 'Good morning' },
    ]

    it('should parse valid JSON response', () => {
      const raw = '{"hello": "你好", "world": "世界", "greeting": "早上好"}'
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
        greeting: '早上好',
      })
    })

    it('should parse JSON wrapped in markdown code block', () => {
      const raw = '```json\n{"hello": "你好", "world": "世界", "greeting": "早上好"}\n```'
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
        greeting: '早上好',
      })
    })

    it('should parse JSON with extra text around it', () => {
      const raw = 'Here is the translation:\n{"hello": "你好", "world": "世界", "greeting": "早上好"}\nDone!'
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
        greeting: '早上好',
      })
    })

    it('should parse multi-line JSON', () => {
      const raw = `{
  "hello": "你好",
  "world": "世界",
  "greeting": "早上好"
}`
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
        greeting: '早上好',
      })
    })

    it('should fallback to line-by-line parsing when JSON is invalid', () => {
      const raw = '你好\n世界\n早上好'
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
        greeting: '早上好',
      })
    })

    it('should handle quoted lines in fallback mode', () => {
      const raw = '"你好"\n"世界"\n"早上好"'
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
        greeting: '早上好',
      })
    })

    it('should handle fewer lines than items in fallback mode', () => {
      const raw = '你好\n世界'
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({
        hello: '你好',
        world: '世界',
      })
    })

    it('should return empty object for empty input', () => {
      const raw = ''
      const result = parseBatchResponse(raw, items)
      expect(result).to.eql({})
    })

    it('should preserve placeholders in translated text', () => {
      const placeholderItems = [
        { key: 'msg', text: 'Hello {name}, you have {count} messages' },
      ]
      const raw = '{"msg": "你好 {name}，你有 {count} 条消息"}'
      const result = parseBatchResponse(raw, placeholderItems)
      expect(result.msg).to.equal('你好 {name}，你有 {count} 条消息')
    })
  })

  describe('batch grouping logic', () => {
    interface MockJob {
      readonly source: string
      readonly locale: string
      readonly keypath: string
    }

    function groupByLanguagePair(jobs: MockJob[]): Map<string, MockJob[]> {
      const groupMap = new Map<string, MockJob[]>()
      for (const job of jobs) {
        const groupKey = `${job.source}->${job.locale}`
        const group = groupMap.get(groupKey) ?? []
        group.push(job)
        groupMap.set(groupKey, group)
      }
      return groupMap
    }

    it('should group jobs by language pair', () => {
      const jobs: MockJob[] = [
        { source: 'en', locale: 'zh-CN', keypath: 'key.a' },
        { source: 'en', locale: 'ja', keypath: 'key.b' },
        { source: 'en', locale: 'zh-CN', keypath: 'key.c' },
        { source: 'en', locale: 'ja', keypath: 'key.d' },
        { source: 'en', locale: 'ko', keypath: 'key.e' },
      ]
      const groups = groupByLanguagePair(jobs)
      expect(groups.size).to.equal(3)
      expect(groups.get('en->zh-CN')!.length).to.equal(2)
      expect(groups.get('en->ja')!.length).to.equal(2)
      expect(groups.get('en->ko')!.length).to.equal(1)
    })

    it('should handle single job', () => {
      const jobs: MockJob[] = [
        { source: 'en', locale: 'zh-CN', keypath: 'key.a' },
      ]
      const groups = groupByLanguagePair(jobs)
      expect(groups.size).to.equal(1)
      expect(groups.get('en->zh-CN')!.length).to.equal(1)
    })

    it('should handle empty jobs', () => {
      const groups = groupByLanguagePair([])
      expect(groups.size).to.equal(0)
    })
  })
})
