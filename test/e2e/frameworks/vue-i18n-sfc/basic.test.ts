import { readFileSync } from 'node:fs'
import { Position, window } from 'vscode'
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

  it('writes a dirty SFC without changing other locale blocks', async () => {
    await openFile('src/CompA.vue')
    const editor = window.activeTextEditor!
    await editor.edit(edit => edit.insert(new Position(0, 0), '<!-- unsaved change -->\n'))
    await timeout(500)
    const otherBlock = '<i18n lang=\'yaml\' locale=\'ja\'>\nlanguage: 日本語\n</i18n>'
    is(editor.document.getText().includes(otherBlock), true)
    await CurrentFile.loader.write({
      filepath: editor.document.uri.fsPath,
      features: { VueSfc: true },
      keypath: 'hello',
      locale: 'en',
      value: 'Updated greeting',
    })
    is(editor.document.isDirty, true)
    is(editor.document.getText().startsWith('<!-- unsaved change -->'), true)
    is(editor.document.getText().includes(otherBlock), true)
    is(CurrentFile.loader.getValueByKey('hello', 'en'), 'Updated greeting')
    is(CurrentFile.loader.getValueByKey('hello', 'ja'), 'こんにちは、世界 A！')
    await editor.document.save()
    await timeout(500)
    await CurrentFile.loader.write({
      filepath: editor.document.uri.fsPath,
      features: { VueSfc: true },
      keypath: 'hello',
      locale: 'en',
      value: 'Saved greeting',
    })
    const saved = readFileSync(editor.document.uri.fsPath, 'utf8')
    is(saved.includes('Saved greeting'), true)
    is(saved.includes(otherBlock), true)
  })
})
