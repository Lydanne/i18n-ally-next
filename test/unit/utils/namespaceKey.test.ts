import { expect } from 'chai'
import { withFileNamespace } from '../../../src/utils/namespaceKey'

describe('withFileNamespace', () => {
  it('prefixes a generated extraction key with the target filename namespace', () => {
    expect(withFileNamespace('hello.welcome', 'test', '.'))
      .to
      .equal('test.hello.welcome')
  })

  it('does not prefix the same namespace twice', () => {
    expect(withFileNamespace('test.hello.welcome', 'test', '.'))
      .to
      .equal('test.hello.welcome')
  })

  it('supports a custom namespace delimiter', () => {
    expect(withFileNamespace('hello.welcome', 'test', ':'))
      .to
      .equal('test:hello.welcome')
  })

  it('keeps the key unchanged without a filename namespace', () => {
    expect(withFileNamespace('hello.welcome', undefined, '.'))
      .to
      .equal('hello.welcome')
  })
})
