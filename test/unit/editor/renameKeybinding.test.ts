import { expect } from 'chai'
import packageJson from '../../../package.json'

describe('i18n F2 keybinding', () => {
  it('routes F2 through the i18n cursor rename command when the extension is enabled', () => {
    expect(packageJson.contributes.keybindings).to.deep.include({
      command: 'i18n-ally-next.rename-key-at-cursor',
      key: 'f2',
      when: 'editorTextFocus && i18n-ally-next-enabled',
    })
  })

  it('contributes the cursor rename command', () => {
    expect(packageJson.contributes.commands.some(command =>
      command.command === 'i18n-ally-next.rename-key-at-cursor',
    )).to.equal(true)
  })
})
