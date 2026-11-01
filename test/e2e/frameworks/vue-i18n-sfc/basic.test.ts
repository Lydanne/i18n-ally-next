import { CurrentFile, getExt, Global, is, not, openFile, setupTest, timeout } from '../../ctx'

setupTest('Vue i18n SFC', () => {
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
    is(Global.enabledFrameworks.length, 3)
    is(Global.enabledFrameworks[0].id, 'vue')
    is(Global.enabledFrameworks[1].id, 'general')
    is(Global.enabledFrameworks[2].id, 'vue-sfc')
  })

  it('loads inline JSON and YAML messages for the active component', async () => {
    await openFile('src/CompA.vue')
    await timeout(500)
    is(CurrentFile.loader.getValueByKey('hello', 'en'), 'hello world A!')
    is(CurrentFile.loader.getValueByKey('hello', 'ja'), 'こんにちは、世界 A！')
    is(CurrentFile.loader.getValueByKey('language', 'en'), 'English')
    is(CurrentFile.loader.getValueByKey('language', 'ja'), '日本語')
  })

  it('switches scoped messages with the active component', async () => {
    await openFile('src/App.vue')
    await timeout(500)
    is(CurrentFile.loader.getValueByKey('hello', 'en'), 'hello world!')
  })
})
