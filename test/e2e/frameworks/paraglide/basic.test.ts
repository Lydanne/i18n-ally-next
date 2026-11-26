import { languages, Range, window } from 'vscode'
import { expect, Global, KeyDetector, openFile, setupTest, timeout } from '../../ctx'

setupTest('Paraglide messages', () => {
  it('detects message calls from an imported namespace', async function () {
    this.timeout(10000)
    await openFile('src/app.js')
    await timeout(500)
    expect(Global.enabledFrameworks.map(f => f.id)).to.include('paraglide')
    const doc = window.activeTextEditor!.document
    const keys = KeyDetector.getKeys(doc)
    expect(keys.map(key => key.key)).to.deep.equal(['hello_world', 'hello-world', 'hello_world', 'hello-world'])
    const deadline = Date.now() + 8000
    while (!Global.loader && Date.now() < deadline)
      await timeout(100)
    expect(Boolean(Global.loader), 'locale loader should initialize').to.equal(true)
    for (const key of keys) {
      const target = KeyDetector.getKeyAndRange(doc, doc.positionAt(key.start))!
      expect(doc.getText(target.range)).to.equal(key === keys[3] ? 'hello\\x2dworld' : key.key)
      expect(Global.loader.getValueByKey(key.key, 'en')).to.be.a('string')
    }
    const start = doc.getText().indexOf('./paraglide/messages.js')
    await window.activeTextEditor!.edit(edit => edit.replace(new Range(doc.positionAt(start), doc.positionAt(start + './paraglide/messages.js'.length)), './other/strings.js'))
    expect(KeyDetector.getKeys(doc).map(key => key.key)).to.deep.equal(['hello_world'])
    const next = doc.getText().indexOf('./paraglide/messages.js')
    await window.activeTextEditor!.edit(edit => edit.replace(new Range(doc.positionAt(next), doc.positionAt(next + './paraglide/messages.js'.length)), './other/strings.js'))
    expect(KeyDetector.getKeys(doc)).to.deep.equal([])
  })
  it('does not treat an unrelated m object as translations', async () => {
    await openFile('src/unrelated.js')
    expect(KeyDetector.getKeys(window.activeTextEditor!.document)).to.deep.equal([])
  })
  it('only reads top-level component scripts', async () => {
    await openFile('src/Component.vue')
    const document = await languages.setTextDocumentLanguage(window.activeTextEditor!.document, 'vue')
    expect(KeyDetector.getKeys(document).map(key => key.key)).to.deep.equal(['hello_world'])
  })
})
