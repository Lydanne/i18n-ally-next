/* eslint-disable no-template-curly-in-string */
import { expect } from 'chai'
import { parseHardString, stringConcatenationToTemplate } from '../../../src/extraction/parseHardString'

describe('parseHardString', () => {
  it('stringContractionToTemplate', () => {
    expect(stringConcatenationToTemplate('\'a\' + b + \'c\'')).to.eql('`a${b}c`')
    expect(stringConcatenationToTemplate('"foo"+bar()')).to.eql('`foo${bar()}`')
    expect(stringConcatenationToTemplate('a + b + c')).to.eql('`${a + b + c}`')
    expect(stringConcatenationToTemplate('a + ` 1 ${d}`+ b + c')).to.eql('`${a} 1 ${d}${b + c}`')
  })

  it('reuses Python f-string parsing for single extraction', () => {
    expect(parseHardString(`f"Hello {user.name} from {load_place()}"`, 'python')).to.deep.include({
      text: 'Hello {name} from {value}',
      source: 'python-fstring',
      args: ['user.name', 'load_place()'],
      namedArgs: [
        { name: 'name', expression: 'user.name', order: 0 },
        { name: 'value', expression: 'load_place()', order: 1 },
      ],
    })
  })
})
