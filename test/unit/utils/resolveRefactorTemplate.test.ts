import { expect } from 'chai'
import { applyRefactorTemplate, resolveRefactorTemplate } from '../../../src/utils/resolveRefactorTemplate'

describe('resolveRefactorTemplate', () => {
  it('returns empty array for empty input', () => {
    expect(resolveRefactorTemplate([])).to.deep.equal([])
  })

  it('wraps a plain string into a template object', () => {
    const result = resolveRefactorTemplate(["t('$1')"])
    expect(result).to.deep.equal([{ templates: ["t('$1')"] }])
  })

  it('passes through an object with templates array', () => {
    const result = resolveRefactorTemplate([{ templates: ["t('$1')", "i18n.t('$1')"] }])
    expect(result).to.deep.equal([{ templates: ["t('$1')", "i18n.t('$1')"] }])
  })

  it('merges singular "template" into the templates array', () => {
    const result = resolveRefactorTemplate([{ templates: ["t('$1')"], template: "i18n.t('$1')" }])
    expect(result[0].templates).to.deep.equal(["t('$1')", "i18n.t('$1')"])
  })

  it('does not mutate the original templates array when adding "template"', () => {
    const original = ["t('$1')"]
    const input = [{ templates: original, template: "i18n.t('$1')" }]
    resolveRefactorTemplate(input)
    // original array should be unchanged
    expect(original).to.deep.equal(["t('$1')"])
  })

  it('preserves source, include, and exclude fields', () => {
    const result = resolveRefactorTemplate([
      { source: 'js-string', templates: ["t('$1')"], include: ['**/*.ts'], exclude: ['**/*.spec.ts'] },
    ])
    expect(result[0]).to.include({ source: 'js-string' })
    expect(result[0].include).to.deep.equal(['**/*.ts'])
    expect(result[0].exclude).to.deep.equal(['**/*.spec.ts'])
  })

  it('handles mixed array of strings and objects', () => {
    const result = resolveRefactorTemplate(["t('$1')", { templates: ["i18n.t('$1')"] }])
    expect(result).to.deep.equal([
      { templates: ["t('$1')"] },
      { templates: ["i18n.t('$1')"] },
    ])
  })

  it('calling twice does not accumulate "template" into templates', () => {
    const input = [{ templates: ["t('$1')"], template: "i18n.t('$1')" }]
    const first = resolveRefactorTemplate(input)
    const second = resolveRefactorTemplate(input)
    expect(first[0].templates).to.deep.equal(["t('$1')", "i18n.t('$1')"])
    expect(second[0].templates).to.deep.equal(["t('$1')", "i18n.t('$1')"])
  })
})

/**
 * Tests for applyRefactorTemplate — the shared utility used by
 * Global.interpretRefactorTemplates to substitute key/args into template strings.
 */

describe('refactor template replacement', () => {
  it('replaces $1 with the key', () => {
    expect(applyRefactorTemplate("t('$1')", 'my.key')).to.equal("t('my.key')")
  })

  it('replaces all occurrences of $1', () => {
    expect(applyRefactorTemplate('$1 + $1', 'my.key')).to.equal('my.key + my.key')
  })

  it('replaces {key} with the key', () => {
    expect(applyRefactorTemplate("t('{key}')", 'my.key')).to.equal("t('my.key')")
  })

  it('replaces all occurrences of {key}', () => {
    expect(applyRefactorTemplate('{key} + {key}', 'my.key')).to.equal('my.key + my.key')
  })

  it('replaces {args} with args string', () => {
    expect(applyRefactorTemplate("t('{key}'{args})", 'my.key', ', arg1')).to.equal("t('my.key', arg1)")
  })

  it('handles vue template mustache syntax with $1', () => {
    expect(applyRefactorTemplate("{{ t('$1') }}", 'lets_test_this_translation')).to.equal("{{ t('lets_test_this_translation') }}")
  })

  it('handles vue $t with $1', () => {
    expect(applyRefactorTemplate("{{ $t('$1') }}", 'my.key')).to.equal("{{ $t('my.key') }}")
  })

  it('does not alter template when key placeholder is absent', () => {
    expect(applyRefactorTemplate('static-string', 'my.key')).to.equal('static-string')
  })

  it('handles html-attribute source template with $1', () => {
    expect(applyRefactorTemplate("t('$1')", 'lets_test_this_translation')).to.equal("t('lets_test_this_translation')")
  })

  it('handles js-string source template with $1', () => {
    expect(applyRefactorTemplate("t('$1')", 'hello_world')).to.equal("t('hello_world')")
  })
})
