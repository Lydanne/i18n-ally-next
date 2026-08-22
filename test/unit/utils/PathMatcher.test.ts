import { expect } from 'chai'
import { GetNamespaceFromKeypath, MaterializePathMatcher, ParsePathMatcher, PathMatcherHasNamespace, ReplaceLocale } from '../../../src/utils/PathMatcher'

describe('pathMatching', () => {
  const cases = [
    ['{namespace}/**/{locale}.json', 'moduleC/nested/locales/zh-cn.json', 'moduleC', 'zh-cn'],
    ['{namespaces}/{locale}.json', 'modules/nested/en.json', 'modules/nested', 'en'],
    ['{namespaces}/{locale}.json', 'modules/nested/en.js', null],
    ['{namespaces}/{locale}.(json|yml)', 'modules/nested/en.yml', 'modules/nested', 'en'],
    ['{namespace}/{locale}.*', 'nested/en.whatever', 'nested', 'en'],
    ['{namespaces?}/{locale}.*', 'nested/en.whatever', 'nested', 'en'],
    ['{namespaces?}/?{locale}.*', 'en.whatever', '', 'en'],
    ['{locale}/{namespaces}.*', 'zh-cn/hello/world/messages.json', 'hello/world/messages', 'zh-cn'],
    ['{locale}/modules/{namespaces}.*', 'jp/modules/hello/world.json', 'hello/world', 'jp'],
    ['{locale}/modules/*.*', 'jp/modules/a.json', undefined, 'jp'],
    ['{locale}/modules/*.js', 'jp/modules/a.js', undefined, 'jp'],
    ['**/{locale}.json', 'fr.json', undefined, 'fr'],
    ['hello/**/{locale}.json', 'hello/fr.json', undefined, 'fr'],
    ['nls.?{locale?}.json', 'nls.json', undefined, ''],
  ] as const

  for (const [map, path, expectedNamespace, expectedLocale] of cases) {
    it(map, () => {
      const re = ParsePathMatcher(map)
      const result = re.exec(path)

      if (!result) {
        expect(expectedNamespace).to.eql(null)
      }
      else {
        expect(result.groups?.namespace).to.eql(expectedNamespace)
        expect(result.groups?.locale).to.eql(expectedLocale)
      }
    })
  }
})

describe('replaceLocale', () => {
  const cases = [
    ['en/nested/en.json', '{namespaces}/{locale}.json', 'zh', 'en/nested/zh.json'],
    ['en/zh/fr/en.json', 'en/zh/{locale}/{namespace}.json', 'fr', 'en/zh/fr/en.json'],
  ] as const

  for (const c of cases) {
    it(c[0], () => {
      const args = c.slice(0, -1)
      const result = c[c.length - 1]
      expect(
        // @ts-ignore
        ReplaceLocale(...args),
      ).to.eql(result)
    })
  }
})

describe('extraction namespace path', () => {
  it('detects namespace placeholders', () => {
    expect(PathMatcherHasNamespace('{locale}/{namespace}.json')).to.eql(true)
    expect(PathMatcherHasNamespace('{locale}/{namespaces}.{ext}')).to.eql(true)
    expect(PathMatcherHasNamespace('{locale}.json')).to.eql(false)
  })

  it('extracts the first namespace segment with a dot delimiter', () => {
    expect(GetNamespaceFromKeypath('hello.welcome', '.')).to.eql('hello')
    expect(GetNamespaceFromKeypath('hello.welcome.title', '.')).to.eql('hello')
    expect(GetNamespaceFromKeypath('welcome', '.')).to.eql(undefined)
  })

  it('supports non-dot namespace delimiters', () => {
    expect(GetNamespaceFromKeypath('errors:network.timeout', ':')).to.eql('errors')
  })

  it('materializes a filename namespace path', () => {
    expect(MaterializePathMatcher('{locale}/{namespace}.json', 'zh-CN', 'hello')).to.eql('zh-CN/hello.json')
    expect(MaterializePathMatcher('{locale}/**/{namespace}.{ext}', 'zh-CN', 'hello', 'json')).to.eql('zh-CN/hello.json')
  })

  it('materializes nested namespace paths', () => {
    expect(MaterializePathMatcher('{locale}/{namespaces}.{ext}', 'en', 'account.profile', 'json')).to.eql('en/account/profile.json')
  })

  it('does not materialize locale-only or ambiguous wildcard paths', () => {
    expect(MaterializePathMatcher('{locale}.json', 'en', 'hello')).to.eql(undefined)
    expect(MaterializePathMatcher('{locale}/*/{namespace}.json', 'en', 'hello')).to.eql(undefined)
  })
})
