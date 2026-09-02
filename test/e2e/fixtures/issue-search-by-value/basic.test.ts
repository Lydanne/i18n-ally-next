import type { CodeLens, Location } from 'vscode'
import { commands, Position, Selection, window, workspace } from 'vscode'
import { Commands, CurrentFile, expect, getExt, Global, KeyDetector, openFile, setupTest, timeout } from '../../ctx'

setupTest('翻譯文字反向引用', () => {
  before(async () => {
    await openFile('src/index.js')
    await getExt().activate()
    for (let attempt = 0; attempt < 50; attempt++) {
      if (Global.loader?.getValueByKey('common:save', 'zh-TW') === '儲存變更')
        break
      await timeout(100)
    }
    CurrentFile.update(window.activeTextEditor!.document.uri)
    expect(CurrentFile.loader.getValueByKey('common:save', 'en')).to.equal('Save changes')
    expect(CurrentFile.loader.getValueByKey('common:save', 'zh-TW')).to.equal('儲存變更')
  })

  for (const file of ['locales/en/common.json', 'locales/zh-TW/common.yaml']) {
    it(`${file} 的 key 可定位至帶有 namespace 的程式引用`, async () => {
      await openFile(file)
      const document = window.activeTextEditor!.document
      const usages = KeyDetector.getUsages(document, CurrentFile.loader)!
      const key = usages.keys.find(key => key.key === 'save')!
      const range = KeyDetector.getRange(document, key, true)
      expect(document.getText(range)).to.equal('save')
      expect(KeyDetector.getKey(document, range.start)).to.equal('common:save')

      const references = await commands.executeCommand<Location[]>('vscode.executeReferenceProvider', document.uri, range.start)
      expect(references).to.have.lengthOf(1)
      const reference = references![0]
      const source = await workspace.openTextDocument(reference.uri)
      expect(source.getText(reference.range)).to.equal('common:save')

      const lenses = await commands.executeCommand<CodeLens[]>('vscode.executeCodeLensProvider', document.uri)
      expect(lenses!.some(lens => lens.command?.arguments?.[0]?.keypath === 'common:save')).to.equal(true)
    })
  }

  it('儲存程式碼後會更新引用快取', async () => {
    await openFile('src/index.js')
    const editor = window.activeTextEditor!
    const document = editor.document
    const position = new Position(0, 4)
    const references = () => commands.executeCommand<Location[]>('vscode.executeReferenceProvider', document.uri, position)
    expect(await references()).to.have.lengthOf(1)
    const insertion = document.positionAt(document.getText().length)
    await editor.edit(edit => edit.insert(insertion, 't(\'common:save\')\n'))
    await document.save()

    let updated: Location[] | undefined
    for (let attempt = 0; attempt < 30; attempt++) {
      updated = await references()
      if (updated?.length === 2)
        break
      await timeout(100)
    }
    expect(updated).to.have.lengthOf(2)
  })

  it('引用導覽命令會選取正確的 key', async () => {
    await openFile('src/index.js')
    const document = window.activeTextEditor!.document
    const start = document.getText().indexOf('common:cancel')
    await commands.executeCommand(Commands.go_to_location, {
      filepath: document.uri.fsPath,
      start,
      end: start + 'common:cancel'.length,
    })
    expect(window.activeTextEditor!.document.getText(window.activeTextEditor!.selection)).to.equal('common:cancel')
  })

  it('取消搜尋時會保留原本的檔案與選取範圍', async () => {
    await openFile('src/index.js')
    const editor = window.activeTextEditor!
    const selection = new Selection(1, 3, 1, 16)
    editor.selection = selection
    for (const command of [Commands.search_by_value, Commands.find_in_file_by_value]) {
      await commands.executeCommand(command)
      await commands.executeCommand('workbench.action.closeQuickOpen')
      await timeout(100)
      expect(window.activeTextEditor!.document.uri.toString()).to.equal(editor.document.uri.toString())
      expect(window.activeTextEditor!.selection.isEqual(selection)).to.equal(true)
    }
  })

  it('確認檔案內搜尋結果會導覽至 key', async () => {
    await openFile('src/index.js')
    await commands.executeCommand(Commands.find_in_file_by_value)
    await commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
    await timeout(100)
    const editor = window.activeTextEditor!
    expect(editor.document.getText(editor.selection)).to.equal('common:save')
  })
})
