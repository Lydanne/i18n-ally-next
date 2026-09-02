import { expect } from 'chai'
import { searchTranslationKeysByValue } from '../../../src/commands/searchByValueCore'
import { joinNamespaceKey } from '../../../src/core/keypath'
import { createOccurrenceIndex } from '../../../src/core/OccurrenceIndex'
import { parseJsonLocaleAst, parseYamlLocaleAst } from '../../../src/parsers/localeAst'

describe('searchByValue & AST Parsers', () => {
  describe('searchTranslationKeysByValue logic', () => {
    const mockLoader: any = {
      locales: ['zh-TW', 'en', 'ja'],
      flattenLocaleTree: {
        'common.save': {
          type: 'node',
          locales: {
            'zh-TW': { keypath: 'common.save', locale: 'zh-TW', value: '儲存變更', filepath: '/locales/zh-TW.json' },
            'en': { keypath: 'common.save', locale: 'en', value: 'Save changes', filepath: '/locales/en.json' },
            'ja': { keypath: 'common.save', locale: 'ja', value: '保存', filepath: '/locales/ja.json' },
          },
        },
        'common.cancel': {
          type: 'node',
          locales: {
            'zh-TW': { keypath: 'common.cancel', locale: 'zh-TW', value: '取消', filepath: '/locales/zh-TW.json' },
            'en': { keypath: 'common.cancel', locale: 'en', value: 'Cancel', filepath: '/locales/en.json' },
          },
        },
        'user.profile.title': {
          type: 'node',
          locales: {
            'zh-TW': { keypath: 'user.profile.title', locale: 'zh-TW', value: '使用者設定', filepath: '/locales/zh-TW.json' },
            'en': { keypath: 'user.profile.title', locale: 'en', value: 'User Profile Settings', filepath: '/locales/en.json' },
          },
        },
      },
    }

    it('應能透過繁體中文 Value 搜尋到對應的 Key', () => {
      const results = searchTranslationKeysByValue('儲存', mockLoader)
      expect(results).to.have.lengthOf(1)
      expect(results[0].keypath).to.equal('common.save')
      expect(results[0].locale).to.equal('zh-TW')
      expect(results[0].value).to.equal('儲存變更')
    })

    it('應支援不分大小寫的英文 Value 搜尋', () => {
      const results = searchTranslationKeysByValue('profile', mockLoader)
      expect(results).to.have.lengthOf(1)
      expect(results[0].keypath).to.equal('user.profile.title')
      expect(results[0].locale).to.equal('en')
    })

    it('搜尋空白字串應回傳空陣列', () => {
      const results = searchTranslationKeysByValue('   ', mockLoader)
      expect(results).to.deep.equal([])
    })

    it('無相符結果時應回傳空陣列', () => {
      const results = searchTranslationKeysByValue('NonExistentText', mockLoader)
      expect(results).to.deep.equal([])
    })

    it('應忽略查詢前後空白並保留定義檔路徑', () => {
      const results = searchTranslationKeysByValue('  SAVE  ', mockLoader)
      expect(results).to.deep.equal([{
        keypath: 'common.save',
        locale: 'en',
        value: 'Save changes',
        filepath: '/locales/en.json',
      }])
    })

    it('同文字對應多個 key 或語系時應保留每筆結果', () => {
      const loader = {
        locales: ['en', 'zh-TW'],
        flattenLocaleTree: {
          'common:save': { type: 'node', locales: { 'en': { value: 'OK' }, 'zh-TW': { value: 'OK' } } },
          'dialog:confirm': { type: 'node', locales: { en: { value: 'OK' } } },
        },
      }
      expect(searchTranslationKeysByValue('ok', loader).map(({ keypath, locale }) => [keypath, locale]))
        .to
        .deep
        .equal([['common:save', 'en'], ['common:save', 'zh-TW'], ['dialog:confirm', 'en']])
    })
  })

  describe('jsonParser AST Range', () => {
    const jsonText = `{\n  "greeting": "Hello World",\n  "nested": {\n    "item": "Val"\n  }\n}`

    it('應正確解析出所有 key、key range 與 value range', () => {
      const pairs = parseJsonLocaleAst(jsonText)
      expect(pairs).to.have.lengthOf(3)

      const greeting = pairs.find(p => p.key === 'greeting')
      expect(greeting).to.not.equal(undefined)
      expect(jsonText.slice(greeting!.start, greeting!.end)).to.equal('Hello World')
      expect(jsonText.slice(greeting!.keyStart, greeting!.keyEnd)).to.equal('greeting')

      const nestedItem = pairs.find(p => p.key === 'nested.item')
      expect(nestedItem).to.not.equal(undefined)
      expect(jsonText.slice(nestedItem!.start, nestedItem!.end)).to.equal('Val')
      expect(jsonText.slice(nestedItem!.keyStart, nestedItem!.keyEnd)).to.equal('item')
    })

    it('陣列元素沒有 key token 時不應解析失敗', () => {
      const text = `{ "items": ["one", { "title": "Two" }] }`
      const pairs = parseJsonLocaleAst(text)
      const arrayItem = pairs.find(pair => pair.key === 'items.0')

      expect(arrayItem).to.not.equal(undefined)
      expect(arrayItem!.keyStart).to.equal(undefined)
      expect(arrayItem!.keyEnd).to.equal(undefined)
    })
  })

  describe('yamlParser AST Range', () => {
    const yamlText = `greeting: Hello World\nnested:\n  item: Val\n`

    it('應正確解析出 YAML 的 key 與範圍', () => {
      const pairs = parseYamlLocaleAst(yamlText)
      expect(pairs).to.have.lengthOf(2)

      const greeting = pairs.find(p => p.key === 'greeting')
      expect(greeting).to.not.equal(undefined)
      expect(yamlText.slice(greeting!.start - 1, greeting!.end + 1)).to.equal('Hello World')
      expect(yamlText.slice(greeting!.keyStart, greeting!.keyEnd)).to.equal('greeting')

      const nestedItem = pairs.find(p => p.key === 'nested.item')
      expect(nestedItem).to.not.equal(undefined)
      expect(yamlText.slice(nestedItem!.start - 1, nestedItem!.end + 1)).to.equal('Val')
      expect(yamlText.slice(nestedItem!.keyStart, nestedItem!.keyEnd)).to.equal('item')
    })
  })

  describe('occurrence index', () => {
    it('應以 keypath 建立單次查找索引', () => {
      const first = { keypath: 'common.save', filepath: '/a.ts', start: 10, end: 21, line: 2 }
      const second = { keypath: 'common.save', filepath: '/b.ts', start: 30, end: 41, line: 4 }
      const cancel = { keypath: 'common.cancel', filepath: '/c.ts', start: 5, end: 18, line: 1 }
      const index = createOccurrenceIndex([first, second, cancel])

      expect(index.get('common.save')).to.deep.equal([first, second])
      expect(index.get('common.cancel')).to.deep.equal([cancel])
      expect(index.get('missing')).to.equal(undefined)
    })

    it('應支援正規化後的陣列 keypath', () => {
      const occurrence = { keypath: 'items[0].title', filepath: '/a.ts', start: 10, end: 24, line: 2 }
      const index = createOccurrenceIndex([occurrence], key => key.replace(/\[(.*)\]/g, '.$1'))

      expect(index.get('items.0.title')).to.deep.equal([occurrence])
      expect(index.get('items[0].title')).to.equal(undefined)
    })
  })

  describe('namespace key', () => {
    it('應使用框架提供的 namespace delimiter', () => {
      expect(joinNamespaceKey('save', 'common', ':')).to.equal('common:save')
      expect(joinNamespaceKey('save', 'common', '.')).to.equal('common.save')
      expect(joinNamespaceKey('save', undefined, ':')).to.equal('save')
    })
  })
})
