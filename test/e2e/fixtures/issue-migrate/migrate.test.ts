import fs from 'fs'
import path from 'path'
import { commands, workspace } from 'vscode'
import { expect, getExt, is, setupTest, timeout } from '../../ctx'

setupTest('Migration Command', () => {
  const rootPath = workspace.workspaceFolders![0]!.uri.fsPath
  const settingsPath = path.join(rootPath, '.vscode/settings.json')

  describe('before migration', () => {
    it('opens entry file', async () => {
      const doc = await workspace.openTextDocument(
        path.join(rootPath, 'package.json'),
      )
      is(doc !== undefined, true)
    })

    it('extension is active', () => {
      const ext = getExt()
      is(ext?.isActive, true)
    })

    it('legacy custom framework file exists', () => {
      const oldPath = path.join(rootPath, '.vscode/i18n-ally-custom-framework.yml')
      expect(fs.existsSync(oldPath)).to.equal(true)
    })

    it('legacy reviews file exists', () => {
      const oldPath = path.join(rootPath, '.vscode/i18n-ally-reviews.yml')
      expect(fs.existsSync(oldPath)).to.equal(true)
    })

    it('new config files do not exist yet', () => {
      const newCustomFramework = path.join(rootPath, '.vscode/i18n-ally-next-custom-framework.yml')
      const newReviews = path.join(rootPath, '.vscode/i18n-ally-next-reviews.yml')
      expect(fs.existsSync(newCustomFramework)).to.equal(false)
      expect(fs.existsSync(newReviews)).to.equal(false)
    })

    it('legacy settings.json contains i18n-ally config', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      expect(settings['i18n-ally.localesPaths']).to.eql(['locales'])
      expect(settings['i18n-ally.sourceLanguage']).to.equal('en')
      expect(settings['i18n-ally.displayLanguage']).to.equal('zh-CN')
      expect(settings['i18n-ally.keystyle']).to.equal('nested')
    })

    it('legacy settings.json does not contain i18n-ally-next config', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      is(settings['i18n-ally-next.localesPaths'] === undefined, true)
    })
  })

  describe('execute migration', () => {
    it('runs migration command successfully', async () => {
      await commands.executeCommand('i18n-ally-next.migrate-from-i18n-ally')
      await timeout(3000)
    })
  })

  describe('after migration - file migration', () => {
    it('removes legacy custom framework file', () => {
      const oldPath = path.join(rootPath, '.vscode/i18n-ally-custom-framework.yml')
      expect(fs.existsSync(oldPath)).to.equal(false)
    })

    it('creates new custom framework file with correct content', () => {
      const newPath = path.join(rootPath, '.vscode/i18n-ally-next-custom-framework.yml')
      expect(fs.existsSync(newPath)).to.equal(true)
      const content = fs.readFileSync(newPath, 'utf-8')
      expect(content).to.include('languageIds')
      expect(content).to.include('javascript')
      expect(content).to.include('typescript')
      expect(content).to.include('usageMatchRegex')
      expect(content).to.include('monopoly: true')
    })

    it('removes legacy reviews file', () => {
      const oldPath = path.join(rootPath, '.vscode/i18n-ally-reviews.yml')
      expect(fs.existsSync(oldPath)).to.equal(false)
    })

    it('creates new reviews file with correct content', () => {
      const newPath = path.join(rootPath, '.vscode/i18n-ally-next-reviews.yml')
      expect(fs.existsSync(newPath)).to.equal(true)
      const content = fs.readFileSync(newPath, 'utf-8')
      expect(content).to.include('reviews')
      expect(content).to.include('common.hello')
      expect(content).to.include('approved: true')
    })
  })

  describe('after migration - workspace config migration', () => {
    it('migrates localesPaths to new namespace in settings.json', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      expect(settings['i18n-ally-next.localesPaths']).to.eql(['locales'])
    })

    it('migrates sourceLanguage to new namespace in settings.json', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      expect(settings['i18n-ally-next.sourceLanguage']).to.equal('en')
    })

    it('migrates displayLanguage to new namespace in settings.json', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      expect(settings['i18n-ally-next.displayLanguage']).to.equal('zh-CN')
    })

    it('migrates keystyle to new namespace in settings.json', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      expect(settings['i18n-ally-next.keystyle']).to.equal('nested')
    })

    it('clears legacy config from settings.json', () => {
      const content = fs.readFileSync(settingsPath, 'utf-8')
      const settings = JSON.parse(content)
      is(settings['i18n-ally.localesPaths'] === undefined, true)
      is(settings['i18n-ally.sourceLanguage'] === undefined, true)
      is(settings['i18n-ally.displayLanguage'] === undefined, true)
      is(settings['i18n-ally.keystyle'] === undefined, true)
    })
  })
})
