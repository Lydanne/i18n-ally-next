import { expect } from 'chai'
import { detectionForSelection } from '../../../src/extraction/utils'

describe('detectionForSelection', () => {
  const first = { text: 'hello', start: 10, end: 15, source: 'html-inline' as const }
  const second = { text: 'world', start: 20, end: 25, source: 'js-string' as const }
  it('finds a selection inside or surrounding one detection', () => {
    expect(detectionForSelection([first, second], 11, 14)).to.equal(first)
    expect(detectionForSelection([first, second], 9, 16)).to.equal(first)
  })
  it('does not guess for unrelated or ambiguous selections', () => {
    expect(detectionForSelection([first, second], 16, 19)).to.equal(undefined)
    expect(detectionForSelection([first, second], 9, 26)).to.equal(undefined)
  })
})
