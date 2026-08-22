import type { KeyInDocument } from '../../../src/core/types'
import { expect } from 'chai'
import { findRenameTarget } from '../../../src/editor/renameTarget'

describe('findRenameTarget', () => {
  const keys: KeyInDocument[] = [
    { key: 'hello.welcome', start: 8, end: 21, quoted: true },
    { key: 'account.title', start: 30, end: 43, quoted: true },
  ]

  it('resolves a key from a cursor inside it', () => {
    expect(findRenameTarget(keys, 12)).to.deep.equal(keys[0])
  })

  it('resolves a key when the cursor is at its end boundary', () => {
    expect(findRenameTarget(keys, 21)).to.deep.equal(keys[0])
  })

  it('resolves the whole key from an exact selection', () => {
    expect(findRenameTarget(keys, 21, 8, 21)).to.deep.equal(keys[0])
  })

  it('resolves the whole key from a partial selection', () => {
    expect(findRenameTarget(keys, 21, 14, 21)).to.deep.equal(keys[0])
  })

  it('supports a reverse selection', () => {
    expect(findRenameTarget(keys, 8, 21, 8)).to.deep.equal(keys[0])
  })

  it('accepts a selection including the surrounding quotes', () => {
    expect(findRenameTarget(keys, 22, 7, 22)).to.deep.equal(keys[0])
  })

  it('rejects a selection crossing multiple keys', () => {
    expect(findRenameTarget(keys, 43, 8, 43)).to.equal(undefined)
  })

  it('returns undefined outside key usages', () => {
    expect(findRenameTarget(keys, 25)).to.equal(undefined)
  })
})
