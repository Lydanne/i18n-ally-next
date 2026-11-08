import { window } from 'vscode'
import { expect, getExt, Global, is, KeyDetector, not, openFile, setupTest, timeout } from '../../ctx'

setupTest('Shopify React i18next', () => {
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
    is(Global.enabledFrameworks[0].id, 'i18next-shopify')
  })

  it('get correct coverage report', async function () {
    this.timeout(10000)
    not(Global, undefined)
    const deadline = Date.now() + 8000
    while (!Global.loader && Date.now() < deadline)
      await timeout(100)
    not(Global.loader, undefined)
    const coverage = Global.loader.getCoverage('en')
    expect(coverage).to.matchSnapshot()
  })

  it('get keys', async () => {
    await openFile('src/App.jsx')
    await timeout(500)
    const keys = KeyDetector.getKeys(window.activeTextEditor!.document)
    expect(keys).to.matchSnapshot()
  })
})
