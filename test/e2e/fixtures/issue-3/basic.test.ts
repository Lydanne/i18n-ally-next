import { window } from 'vscode'
import { expect, getExt, Global, is, KeyDetector, not, openFile, setupTest, timeout } from '../../ctx'

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
})
