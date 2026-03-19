import { window } from 'vscode'
import { expect, getExt, Global, is, KeyDetector, not, openFile, setupTest, timeout } from '../../ctx'

setupTest('Transloco kebab-case namespace (Issue: kebab-cased-namespace)', () => {
  it('opens entry file', async () => {
    await openFile('package.json')
  })

  it('is active', () => {
    const ext = getExt()
    is(ext?.isActive, true)
  })

  it('enables transloco framework', async () => {
    not(Global, undefined)
    is(Global.enabled, true)
    is(Global.enabledFrameworks.length, 1)
    is(Global.enabledFrameworks[0].id, 'transloco')
  })

  it('namespace mode is enabled', async () => {
    not(Global, undefined)
    is(Global.namespaceEnabled, true)
  })

  it('loads locale files for both namespaces', async () => {
    await timeout(1000)
    not(Global.loader, undefined)

    const keys = Global.loader.keys
    // Both namespaces should have loaded keys
    expect(keys.length).to.be.greaterThan(0)

    // The raw filesystem namespace 'app-not-working' should have keys
    const appNotWorkingKeys = keys.filter((k: string) => k.startsWith('app-not-working.'))
    expect(appNotWorkingKeys.length).to.be.greaterThan(0)

    // The camelCase namespace 'appworking' should also have keys
    const appworkingKeys = keys.filter((k: string) => k.startsWith('appworking.'))
    expect(appworkingKeys.length).to.be.greaterThan(0)
  })

  it('resolves keys under camelCase alias for kebab-case namespace (the bug fix)', async () => {
    await timeout(500)
    not(Global.loader, undefined)

    // 'app-not-working' namespace contains { test: { key: ... }, shared: { title: ... } }
    // Transloco converts 'app-not-working' scope to 'appNotWorking' prefix in templates.
    // After the fix, 'appNotWorking.test.key' must resolve to a tree node.
    const nodeKebabKey = Global.loader.getTreeNodeByKey('appNotWorking.test.key')
    not(nodeKebabKey, undefined)
    is(nodeKebabKey?.type, 'node')

    const nodeKebabTitle = Global.loader.getTreeNodeByKey('appNotWorking.shared.title')
    not(nodeKebabTitle, undefined)
    is(nodeKebabTitle?.type, 'node')
  })

  it('still resolves keys under camelCase namespace without conversion', async () => {
    await timeout(500)
    not(Global.loader, undefined)

    // 'appworking' namespace does not need conversion (no hyphens).
    // These keys should be resolvable as-is.
    const nodeWorking = Global.loader.getTreeNodeByKey('appworking.test.anotherkey')
    not(nodeWorking, undefined)
    is(nodeWorking?.type, 'node')

    const nodeWorkingTitle = Global.loader.getTreeNodeByKey('appworking.shared.title')
    not(nodeWorkingTitle, undefined)
    is(nodeWorkingTitle?.type, 'node')
  })

  it('getKeys detects appNotWorking-prefixed keys from HTML template', async () => {
    await openFile('src/home.component.html')
    await timeout(1000)

    const doc = window.activeTextEditor!.document
    const keys = KeyDetector.getKeys(doc)

    // Keys written in the template use the camelCase prefix 'appNotWorking'
    const kebabAliasKeys = keys.filter((k: { key: string }) => k.key.startsWith('appNotWorking.'))
    expect(kebabAliasKeys.length).to.be.greaterThan(0)

    // Keys written in the template also use camelCase 'appworking' prefix
    const workingKeys = keys.filter((k: { key: string }) => k.key.startsWith('appworking.'))
    expect(workingKeys.length).to.be.greaterThan(0)
  })

  it('coverage includes keys from both namespaces', async () => {
    await timeout(500)
    not(Global.loader, undefined)

    const coverage = Global.loader.getCoverage('en')
    not(coverage, undefined)

    // All loaded keys should be translated (no missing)
    is(coverage!.missing, 0)
    expect(coverage!.total).to.be.greaterThan(0)

    // Both 'app-not-working' and 'appworking' namespace keys must appear
    const hasKebabKey = coverage!.allKeys.some((k: string) => k.startsWith('app-not-working.'))
    const hasWorkingKey = coverage!.allKeys.some((k: string) => k.startsWith('appworking.'))
    is(hasKebabKey, true)
    is(hasWorkingKey, true)
  })
})
