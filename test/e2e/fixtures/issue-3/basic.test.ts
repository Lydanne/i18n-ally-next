import { ConfigurationTarget, window, workspace } from 'vscode'
import { CurrentFile, expect, getExt, Global, is, KeyDetector, not, openFile, setupTest, timeout } from '../../ctx'

setupTest('React with i18next Explicit Namespace (Issue 3)', () => {
  it('opens entry file', async () => {
    await openFile('package.json')
  })

  it('is active', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('enables correct frameworks', async () => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'react-i18next')
  })

  it('detects keys with explicit defaultNamespace correctly', async () => {
    await openFile('src/App.jsx')
    await timeout(500)

    // Test detection parsing
    const keys = KeyDetector.getKeys(window.activeTextEditor!.document)
    expect(keys.length).to.be.greaterThan(0)

    // "errors:network.unauthorized" should be successfully mapped to "errors" namespace
    // and "network.unauthorized" key without failing to resolve in tree.
    const treeNode = Global.loader.getTreeNodeByKey('errors:network.unauthorized')
    not(treeNode, undefined)
    is(treeNode?.type, 'node')
    is(treeNode?.value, 'You are not authorized to perform this action')
  })

  it('clears the current loader when the extension is disabled and restores it when enabled', async () => {
    const config = workspace.getConfiguration('i18n-ally-next')
    try {
      await config.update('disabled', true, ConfigurationTarget.Workspace)
      await Global.update()
      is(Global.loader, undefined)
      is(CurrentFile.loader.loaders.length, 0)
      expect(() => CurrentFile.loader.root).not.to.throw()
    }
    finally {
      await config.update('disabled', undefined, ConfigurationTarget.Workspace)
      await Global.update()
    }
    not(Global.loader, undefined)
    expect(CurrentFile.loader.loaders).to.include(Global.loader)
  })
})
