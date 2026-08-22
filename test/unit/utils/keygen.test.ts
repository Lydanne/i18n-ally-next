import { expect } from 'chai'
import packageJson from '../../../package.json'
import { changeCase } from '../../../src/utils/changeCase'
import { generateTemplateWithKeygenKey, joinTemplateWithGeneratedKey } from '../../../src/utils/keygen'

describe('templateWithKeygen', () => {
  it('joins a filename template prefix with the generated text key', () => {
    expect(joinTemplateWithGeneratedKey('loader', 'test')).to.equal('loader.test')
  })

  it('generates the text segment for single and bulk extraction', () => {
    expect(generateTemplateWithKeygenKey('loader', 'Test', '-', 'kebab-case'))
      .to
      .equal('loader.test')
    expect(generateTemplateWithKeygenKey('loader', 'Welcome Back', '-', 'kebab-case'))
      .to
      .equal('loader.welcome-back')
  })

  it('supports source and random generated-segment strategies', () => {
    expect(generateTemplateWithKeygenKey('loader', 'Test Message', '-', 'default', Infinity, 'source'))
      .to
      .equal('loader.Test Message')
    expect(generateTemplateWithKeygenKey('loader', 'ignored', '-', 'default', Infinity, 'random', () => 'fixed-id'))
      .to
      .equal('loader.fixed-id')
  })

  it('applies keygen style to a source generated segment only', () => {
    expect(generateTemplateWithKeygenKey('loader', 'Test Message', '-', 'kebab-case', Infinity, 'source'))
      .to
      .equal('loader.test-message')
  })

  it('preserves an explicit template separator', () => {
    expect(joinTemplateWithGeneratedKey('loader:', 'test')).to.equal('loader:test')
    expect(joinTemplateWithGeneratedKey('loader.', 'test')).to.equal('loader.test')
  })

  it('applies keygen style to the generated segment without flattening the prefix path', () => {
    const generatedKey = changeCase('hello-world', 'camelCase')
    expect(joinTemplateWithGeneratedKey('loader', generatedKey)).to.equal('loader.helloWorld')
  })

  it('falls back to the generated key when the template prefix is empty', () => {
    expect(joinTemplateWithGeneratedKey('', 'test')).to.equal('test')
  })

  it('contributes the strategy and its dedicated template setting', () => {
    const properties = packageJson.contributes.configuration.properties
    expect(properties['i18n-ally-next.extract.keygenStrategy'].enum)
      .to
      .include('templateWithKeygen')
    expect(properties['i18n-ally-next.extract.keygenTemplateWithKeygen'])
      .to
      .include({ type: 'string', default: '' })
    expect(properties['i18n-ally-next.extract.keygenTemplateWithKeygenStrategy'])
      .to
      .include({ type: 'string', default: 'slug' })
    expect(properties['i18n-ally-next.extract.keygenTemplateWithKeygenStrategy'].enum)
      .to
      .deep
      .equal(['slug', 'random', 'source'])
  })
})
