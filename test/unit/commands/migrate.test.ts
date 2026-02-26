import fs from 'fs'
import os from 'os'
import path from 'path'
import { expect } from 'chai'

/**
 * 迁移命令核心逻辑的纯函数测试
 * 模拟 migrateFiles 和 detectMigrationNeeded 的核心逻辑
 */

/** 需要迁移的文件映射 */
const FILE_MIGRATIONS: Record<string, string> = {
  '.vscode/i18n-ally-custom-framework.yml': '.vscode/i18n-ally-next-custom-framework.yml',
  '.vscode/i18n-ally-reviews.yml': '.vscode/i18n-ally-next-reviews.yml',
}

interface FileMigrationResult {
  migrated: string[]
  errors: string[]
}

/**
 * 检测需要迁移的文件（纯函数版本）
 */
function detectLegacyFiles(rootPath: string, fileMappings: Record<string, string>): string[] {
  const legacyFiles: string[] = []
  for (const oldFile of Object.keys(fileMappings)) {
    const oldPath = path.join(rootPath, oldFile)
    if (fs.existsSync(oldPath))
      legacyFiles.push(oldFile)
  }
  return legacyFiles
}

/**
 * 迁移文件（纯函数版本，用于测试）
 */
function migrateFilesCore(
  rootPath: string,
  fileMappings: Record<string, string>,
): FileMigrationResult {
  const migrated: string[] = []
  const errors: string[] = []
  for (const [oldFile, newFile] of Object.entries(fileMappings)) {
    const oldPath = path.join(rootPath, oldFile)
    const newPath = path.join(rootPath, newFile)
    if (!fs.existsSync(oldPath))
      continue
    if (fs.existsSync(newPath)) {
      errors.push(`Target file already exists: ${newFile}`)
      continue
    }
    try {
      fs.renameSync(oldPath, newPath)
      migrated.push(`${oldFile} → ${newFile}`)
    }
    catch (e) {
      errors.push(`Failed to migrate file ${oldFile}: ${String(e)}`)
    }
  }
  return { migrated, errors }
}

/**
 * 模拟单个命名空间的配置迁移逻辑（纯函数版本）
 */
function migrateConfigFromNamespace(
  legacyConfig: Record<string, unknown>,
  newConfig: Record<string, unknown>,
): { migrated: boolean, keys: string[] } {
  const migratedKeys: string[] = []
  for (const [key, value] of Object.entries(legacyConfig)) {
    if (newConfig[key] === undefined) {
      newConfig[key] = value
      migratedKeys.push(key)
    }
  }
  return { migrated: migratedKeys.length > 0, keys: migratedKeys }
}

/**
 * 模拟多命名空间配置迁移逻辑（纯函数版本）
 */
function migrateConfigFromMultipleNamespaces(
  legacyConfigs: Record<string, Record<string, unknown>>,
  newConfig: Record<string, unknown>,
): { migrated: boolean, keys: string[] } {
  const allKeys: string[] = []
  for (const legacyConfig of Object.values(legacyConfigs)) {
    const result = migrateConfigFromNamespace(legacyConfig, newConfig)
    allKeys.push(...result.keys)
  }
  return { migrated: allKeys.length > 0, keys: allKeys }
}

describe('commands', () => {
  describe('migrate', () => {
    let tempDir: string

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-ally-migrate-test-'))
      fs.mkdirSync(path.join(tempDir, '.vscode'), { recursive: true })
    })

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true })
    })

    describe('detectLegacyFiles', () => {
      it('should return empty array when no legacy files exist', () => {
        const result = detectLegacyFiles(tempDir, FILE_MIGRATIONS)
        expect(result).to.eql([])
      })

      it('should detect legacy custom framework file', () => {
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-custom-framework.yml'),
          'languageIds: typescript',
        )
        const result = detectLegacyFiles(tempDir, FILE_MIGRATIONS)
        expect(result).to.include('.vscode/i18n-ally-custom-framework.yml')
      })

      it('should detect legacy reviews file', () => {
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-reviews.yml'),
          'reviews: {}',
        )
        const result = detectLegacyFiles(tempDir, FILE_MIGRATIONS)
        expect(result).to.include('.vscode/i18n-ally-reviews.yml')
      })

      it('should detect multiple legacy files', () => {
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-custom-framework.yml'),
          'languageIds: typescript',
        )
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-reviews.yml'),
          'reviews: {}',
        )
        const result = detectLegacyFiles(tempDir, FILE_MIGRATIONS)
        expect(result).to.have.length(2)
      })
    })

    describe('migrateFilesCore', () => {
      it('should return empty when no legacy files exist', () => {
        const result = migrateFilesCore(tempDir, FILE_MIGRATIONS)
        expect(result.migrated).to.eql([])
        expect(result.errors).to.eql([])
      })

      it('should migrate custom framework file', () => {
        const oldPath = path.join(tempDir, '.vscode/i18n-ally-custom-framework.yml')
        const newPath = path.join(tempDir, '.vscode/i18n-ally-next-custom-framework.yml')
        fs.writeFileSync(oldPath, 'languageIds: typescript')
        const result = migrateFilesCore(tempDir, FILE_MIGRATIONS)
        expect(result.migrated).to.have.length(1)
        expect(result.migrated[0]).to.include('i18n-ally-custom-framework.yml')
        expect(fs.existsSync(oldPath)).to.equal(false)
        expect(fs.existsSync(newPath)).to.equal(true)
        expect(fs.readFileSync(newPath, 'utf-8')).to.equal('languageIds: typescript')
      })

      it('should migrate reviews file', () => {
        const oldPath = path.join(tempDir, '.vscode/i18n-ally-reviews.yml')
        const newPath = path.join(tempDir, '.vscode/i18n-ally-next-reviews.yml')
        fs.writeFileSync(oldPath, 'reviews: {}')
        const result = migrateFilesCore(tempDir, FILE_MIGRATIONS)
        expect(result.migrated).to.have.length(1)
        expect(fs.existsSync(oldPath)).to.equal(false)
        expect(fs.existsSync(newPath)).to.equal(true)
      })

      it('should migrate multiple files', () => {
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-custom-framework.yml'),
          'languageIds: typescript',
        )
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-reviews.yml'),
          'reviews: {}',
        )
        const result = migrateFilesCore(tempDir, FILE_MIGRATIONS)
        expect(result.migrated).to.have.length(2)
        expect(result.errors).to.eql([])
      })

      it('should report error when target file already exists', () => {
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-custom-framework.yml'),
          'old content',
        )
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-next-custom-framework.yml'),
          'new content',
        )
        const result = migrateFilesCore(tempDir, FILE_MIGRATIONS)
        expect(result.migrated).to.eql([])
        expect(result.errors).to.have.length(1)
        expect(result.errors[0]).to.include('already exists')
      })

      it('should preserve file content after migration', () => {
        const content = `languageIds:
  - typescript
  - javascript
usageMatchRegex:
  - "\\$t\\(['\"]([\\w.-]+)['\"]\\)"
`
        fs.writeFileSync(
          path.join(tempDir, '.vscode/i18n-ally-custom-framework.yml'),
          content,
        )
        migrateFilesCore(tempDir, FILE_MIGRATIONS)
        const newPath = path.join(tempDir, '.vscode/i18n-ally-next-custom-framework.yml')
        expect(fs.readFileSync(newPath, 'utf-8')).to.equal(content)
      })
    })

    describe('migrateConfigFromNamespace', () => {
      it('should return empty when no legacy config exists', () => {
        const result = migrateConfigFromNamespace({}, {})
        expect(result.migrated).to.equal(false)
        expect(result.keys).to.eql([])
      })

      it('should migrate config keys that do not exist in new config', () => {
        const legacyConfig = {
          displayLanguage: 'zh-CN',
          sourceLanguage: 'en',
        }
        const newConfig: Record<string, unknown> = {}
        const result = migrateConfigFromNamespace(legacyConfig, newConfig)
        expect(result.migrated).to.equal(true)
        expect(result.keys).to.include('displayLanguage')
        expect(result.keys).to.include('sourceLanguage')
        expect(newConfig.displayLanguage).to.equal('zh-CN')
        expect(newConfig.sourceLanguage).to.equal('en')
      })

      it('should not override existing new config values', () => {
        const legacyConfig = {
          displayLanguage: 'zh-CN',
          sourceLanguage: 'en',
        }
        const newConfig: Record<string, unknown> = {
          displayLanguage: 'ja',
        }
        const result = migrateConfigFromNamespace(legacyConfig, newConfig)
        expect(result.migrated).to.equal(true)
        expect(result.keys).to.eql(['sourceLanguage'])
        expect(newConfig.displayLanguage).to.equal('ja')
        expect(newConfig.sourceLanguage).to.equal('en')
      })

      it('should handle array values', () => {
        const legacyConfig = {
          ignoredLocales: ['de', 'fr'],
        }
        const newConfig: Record<string, unknown> = {}
        const result = migrateConfigFromNamespace(legacyConfig, newConfig)
        expect(result.migrated).to.equal(true)
        expect(newConfig.ignoredLocales).to.eql(['de', 'fr'])
      })

      it('should handle nested object values', () => {
        const legacyConfig = {
          'translate.engines': ['google', 'deepl'],
        }
        const newConfig: Record<string, unknown> = {}
        const result = migrateConfigFromNamespace(legacyConfig, newConfig)
        expect(result.migrated).to.equal(true)
        expect(newConfig['translate.engines']).to.eql(['google', 'deepl'])
      })
    })

    describe('migrateConfigFromMultipleNamespaces', () => {
      it('should merge configs from multiple legacy namespaces', () => {
        const legacyConfigs = {
          'i18n-ally': { displayLanguage: 'zh-CN', sourceLanguage: 'en' },
          'vue-i18n-ally': { 'translate.google.apiKey': 'key123' },
        }
        const newConfig: Record<string, unknown> = {}
        const result = migrateConfigFromMultipleNamespaces(legacyConfigs, newConfig)
        expect(result.migrated).to.equal(true)
        expect(result.keys).to.have.length(3)
        expect(newConfig.displayLanguage).to.equal('zh-CN')
        expect(newConfig.sourceLanguage).to.equal('en')
        expect(newConfig['translate.google.apiKey']).to.equal('key123')
      })

      it('should not override keys already migrated from earlier namespace', () => {
        const legacyConfigs = {
          'i18n-ally': { displayLanguage: 'zh-CN' },
          'vue-i18n-ally': { displayLanguage: 'ja' },
        }
        const newConfig: Record<string, unknown> = {}
        const result = migrateConfigFromMultipleNamespaces(legacyConfigs, newConfig)
        expect(result.migrated).to.equal(true)
        expect(result.keys).to.eql(['displayLanguage'])
        expect(newConfig.displayLanguage).to.equal('zh-CN')
      })

      it('should not override existing new config values from any namespace', () => {
        const legacyConfigs = {
          'i18n-ally': { sourceLanguage: 'en' },
          'vue-i18n-ally': { displayLanguage: 'ja' },
        }
        const newConfig: Record<string, unknown> = { sourceLanguage: 'fr' }
        const result = migrateConfigFromMultipleNamespaces(legacyConfigs, newConfig)
        expect(result.migrated).to.equal(true)
        expect(result.keys).to.eql(['displayLanguage'])
        expect(newConfig.sourceLanguage).to.equal('fr')
        expect(newConfig.displayLanguage).to.equal('ja')
      })

      it('should return empty when no legacy namespaces have config', () => {
        const legacyConfigs = {
          'i18n-ally': {},
          'vue-i18n-ally': {},
        }
        const newConfig: Record<string, unknown> = {}
        const result = migrateConfigFromMultipleNamespaces(legacyConfigs, newConfig)
        expect(result.migrated).to.equal(false)
        expect(result.keys).to.eql([])
      })
    })
  })
})
