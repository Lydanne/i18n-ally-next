import { commands, ConfigurationTarget, languages, Position, Range, window, workspace } from 'vscode'
import { expect, openFile, setupTest, timeout } from '../../ctx'

setupTest('quick fix editor preference', () => {
  it('uses the configured editor mode for a missing key', async () => {
    await openFile('src/Missing.jsx')
    const editor = window.activeTextEditor!
    await editor.edit(edit => edit.insert(new Position(0, 0), ' '))
    await timeout(800)
    const diagnostic = languages.getDiagnostics(editor.document.uri).find(item => item.code === 'i18n-ally-next-key-missing')
    expect(diagnostic).not.to.equal(undefined)
    const config = workspace.getConfiguration('i18n-ally-next')
    try {
      for (const prefer of [false, true]) {
        await config.update('editor.preferEditor', prefer, ConfigurationTarget.Workspace)
        const actions: any[] = await commands.executeCommand('vscode.executeCodeActionProvider', editor.document.uri, new Range(diagnostic!.range.start, diagnostic!.range.end), 'quickfix') || []
        const wanted = prefer ? 'i18n-ally-next.open-in-editor' : 'i18n-ally-next.edit-key'
        expect(actions.some(action => action.command?.command === wanted)).to.equal(true)
      }
    }
    finally {
      await config.update('editor.preferEditor', undefined, ConfigurationTarget.Workspace)
    }
  })
})
