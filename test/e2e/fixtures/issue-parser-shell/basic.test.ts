import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ConfigurationTarget, workspace } from 'vscode'
import { Global, is, openFile, setupTest } from '../../ctx'

setupTest('TypeScript parser command arguments', () => {
  it('passes compiler options literally without evaluating shell substitutions', async () => {
    await openFile('package.json')
    const marker = path.join(os.tmpdir(), `i18n-parser-${Date.now()}-${process.pid}`)
    const config = workspace.getConfiguration('i18n-ally-next')
    try {
      await config.update('parsers.typescript.compilerOptions', { baseUrl: `$(touch ${marker})` }, ConfigurationTarget.Workspace)
      await Global.update()
      is(Global.loader.getValueByKey('hello', 'en'), 'hello')
      is(fs.existsSync(marker), false)
    }
    finally {
      await config.update('parsers.typescript.compilerOptions', undefined, ConfigurationTarget.Workspace)
      fs.rmSync(marker, { force: true })
    }
  })
})
