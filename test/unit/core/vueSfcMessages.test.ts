import { expect } from 'chai'
import { parseVueSfcMessages, renderVueSfcMessages } from '../../../src/core/loaders/vueSfcMessages'

describe('vue SFC messages', () => {
  const source = [
    '<template><div>hello</div></template>',
    '<i18n>{"en":{"hello":"Hello"},"fr":{"hello":"Bonjour"}}</i18n>',
    '<i18n lang="yaml" locale="en">\ngreeting: Welcome\n</i18n>',
    '<i18n lang="json5" locale="fr">\n{greeting: "Salut",}\n</i18n>',
    '<i18n src="./external.json"></i18n>',
    '<script>export default {}</script>',
    '',
  ].join('\n').replace(/\n/g, '\r\n')

  it('reads JSON, YAML and JSON5 blocks while leaving external blocks alone', () => {
    const sections = parseVueSfcMessages(source, 'component.vue')
    expect(sections).to.have.length(3)
    expect(sections[0].messages.en.hello).to.equal('Hello')
    expect(sections[1].messages.en.greeting).to.equal('Welcome')
    expect(sections[2].messages.fr.greeting).to.equal('Salut')
  })

  it('updates only the selected content and preserves the rest of the file', () => {
    const sections = parseVueSfcMessages(source, 'component.vue')
    sections[1].messages.en.greeting = 'Updated'
    const result = renderVueSfcMessages(source, [sections[1]])
    expect(result).to.include('greeting: Updated\r\n')
    expect(result).to.include('<i18n>{"en":{"hello":"Hello"},"fr":{"hello":"Bonjour"}}</i18n>')
    expect(result).to.include('<i18n lang="json5" locale="fr">\r\n{greeting: "Salut",}\r\n</i18n>')
    expect(result).to.include('<i18n src="./external.json"></i18n>')
    expect(result.replace(/\r\n/g, '')).not.to.include('\n')
  })

  it('rejects non-object messages and does not pollute object prototypes', () => {
    expect(() => parseVueSfcMessages('<i18n>[1,2]</i18n>', 'bad.vue')).to.throw('expected an object')
    const sections = parseVueSfcMessages('<i18n>{"__proto__":{"polluted":true}}</i18n>', 'safe.vue')
    expect(Object.prototype).not.to.have.property('polluted')
    expect(Object.prototype.hasOwnProperty.call(sections[0].messages, '__proto__')).to.equal(true)
  })
})
