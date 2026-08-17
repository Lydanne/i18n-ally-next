import { expect } from 'chai'
import { replaceExtractionKey } from '../../../src/extraction/utils'
import { withFileNamespace } from '../../../src/utils/namespaceKey'

describe('replaceExtractionKey', () => {
  it('prefixes a key in a Python gettext replacement', () => {
    expect(replaceExtractionKey('_("hello.welcome")', 'hello.welcome', 'test.hello.welcome'))
      .to
      .equal('_("test.hello.welcome")')
  })

  it('supports single quotes and named f-string arguments', () => {
    expect(replaceExtractionKey('_(\'greeting\', name=name)', 'greeting', 'test.greeting'))
      .to
      .equal('_(\'test.greeting\', name=name)')
  })

  it('only replaces the key occurrence', () => {
    expect(replaceExtractionKey('translate("value", value=value)', 'value', 'test.value'))
      .to
      .equal('translate("test.value", value=value)')
  })

  it('leaves an unrelated replacement unchanged', () => {
    expect(replaceExtractionKey('translate_dynamic(key)', 'missing', 'test.missing'))
      .to
      .equal('translate_dynamic(key)')
  })

  it('keeps the target filename namespace in the extracted source key', () => {
    const originalKey = 'hello.welcome'
    const resolvedKey = withFileNamespace(originalKey, 'test', '.')

    expect(replaceExtractionKey(`_("${originalKey}")`, originalKey, resolvedKey))
      .to
      .equal('_("test.hello.welcome")')
  })
})
