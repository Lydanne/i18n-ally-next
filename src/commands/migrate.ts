import type { ExtensionContext } from 'vscode'
import fs from 'fs'
import path from 'path'
import { commands, window, workspace } from 'vscode'
import i18n from '~/i18n'
import { Log } from '~/utils'
import { Commands } from './commands'

/** 新版配置命名空间 */
const NEW_NAMESPACE = 'i18n-ally-next'

/** 需要迁移的旧版配置命名空间列表（按优先级排序） */
const LEGACY_NAMESPACES = [
  'i18n-ally',
  'vue-i18n-ally',
] as const

/** 需要迁移的文件映射 */
const FILE_MIGRATIONS: Record<string, string> = {
  '.vscode/i18n-ally-custom-framework.yml': '.vscode/i18n-ally-next-custom-framework.yml',
  '.vscode/i18n-ally-reviews.yml': '.vscode/i18n-ally-next-reviews.yml',
}

interface MigrationResult {
  workspaceConfigMigrated: boolean
  globalConfigMigrated: boolean
  filesMigrated: string[]
  errors: string[]
}

interface ConfigMigrationResult {
  migrated: boolean
  keys: string[]
}

/**
 * 读取 settings.json 文件原始内容
 */
function readSettingsJsonRaw(rootPath: string): string {
  const settingsPath = path.join(rootPath, '.vscode/settings.json')
  if (!fs.existsSync(settingsPath))
    return ''
  return fs.readFileSync(settingsPath, 'utf-8')
}

/**
 * 写入 settings.json 文件原始内容
 */
function writeSettingsJsonRaw(rootPath: string, content: string): void {
  const vscodeDir = path.join(rootPath, '.vscode')
  const settingsPath = path.join(vscodeDir, 'settings.json')
  if (!fs.existsSync(vscodeDir))
    fs.mkdirSync(vscodeDir, { recursive: true })
  fs.writeFileSync(settingsPath, content)
}

/**
 * 从指定命名空间迁移全局（用户级别）配置
 */
async function migrateGlobalConfigFromNamespace(legacyNamespace: string): Promise<ConfigMigrationResult> {
  const legacyConfig = workspace.getConfiguration(legacyNamespace)
  const newConfig = workspace.getConfiguration(NEW_NAMESPACE)
  const migratedKeys: string[] = []
  const inspected = legacyConfig.inspect('')
  const globalValue = inspected?.globalValue as Record<string, unknown> | undefined
  if (!globalValue || Object.keys(globalValue).length === 0)
    return { migrated: false, keys: [] }
  for (const [key, value] of Object.entries(globalValue)) {
    const newInspected = newConfig.inspect(key)
    if (newInspected?.globalValue === undefined) {
      await newConfig.update(key, value, true)
      migratedKeys.push(key)
    }
  }
  if (migratedKeys.length > 0) {
    for (const key of migratedKeys)
      await legacyConfig.update(key, undefined, true)
  }
  return { migrated: migratedKeys.length > 0, keys: migratedKeys }
}

/**
 * 迁移所有旧版命名空间的全局配置
 */
async function migrateGlobalConfig(): Promise<ConfigMigrationResult> {
  const allKeys: string[] = []
  for (const ns of LEGACY_NAMESPACES) {
    const result = await migrateGlobalConfigFromNamespace(ns)
    allKeys.push(...result.keys)
  }
  return { migrated: allKeys.length > 0, keys: allKeys }
}

/**
 * 迁移工作区配置（使用文本替换，保留注释和格式）
 */
function migrateWorkspaceConfigFromFile(rootPath: string): ConfigMigrationResult {
  let content = readSettingsJsonRaw(rootPath)
  if (!content)
    return { migrated: false, keys: [] }
  const migratedKeys: string[] = []
  for (const legacyNamespace of LEGACY_NAMESPACES) {
    const regex = new RegExp(`"${legacyNamespace}\\.`, 'g')
    const matches = content.match(regex)
    if (matches) {
      content = content.replace(regex, `"${NEW_NAMESPACE}.`)
      migratedKeys.push(...matches.map(m => m.slice(1, -1)))
    }
  }
  if (migratedKeys.length > 0)
    writeSettingsJsonRaw(rootPath, content)
  return { migrated: migratedKeys.length > 0, keys: migratedKeys }
}

/**
 * 迁移配置文件
 */
function migrateFiles(rootPath: string): { migrated: string[], errors: string[] } {
  const migrated: string[] = []
  const errors: string[] = []
  for (const [oldFile, newFile] of Object.entries(FILE_MIGRATIONS)) {
    const oldPath = path.join(rootPath, oldFile)
    const newPath = path.join(rootPath, newFile)
    if (!fs.existsSync(oldPath))
      continue
    if (fs.existsSync(newPath)) {
      errors.push(i18n.t('migrate.file_exists', newFile))
      continue
    }
    try {
      fs.renameSync(oldPath, newPath)
      migrated.push(`${oldFile} → ${newFile}`)
      Log.info(`📦 Migrated file: ${oldFile} → ${newFile}`)
    }
    catch (e) {
      errors.push(i18n.t('migrate.file_error', oldFile, String(e)))
      Log.error(e)
    }
  }
  return { migrated, errors }
}

interface MigrationDetection {
  hasWorkspaceConfig: boolean
  hasGlobalConfig: boolean
  hasLegacyFiles: string[]
  legacyNamespaces: string[]
}

/**
 * 检测指定命名空间是否有配置
 */
function hasConfigInNamespace(ns: string, scope: 'workspaceValue' | 'globalValue'): boolean {
  const config = workspace.getConfiguration(ns)
  const inspected = config.inspect('')
  const value = inspected?.[scope] as Record<string, unknown> | undefined
  return value !== undefined && Object.keys(value).length > 0
}

/**
 * 检测 settings.json 文件中是否存在旧版配置（使用文本匹配）
 */
function hasWorkspaceConfigInFile(rootPath: string): { hasConfig: boolean, namespaces: string[] } {
  const content = readSettingsJsonRaw(rootPath)
  if (!content)
    return { hasConfig: false, namespaces: [] }
  const namespaces: string[] = []
  for (const ns of LEGACY_NAMESPACES) {
    const regex = new RegExp(`"${ns}\\.`)
    if (regex.test(content))
      namespaces.push(ns)
  }
  return { hasConfig: namespaces.length > 0, namespaces }
}

/**
 * 检测是否存在需要迁移的内容
 */
function detectMigrationNeeded(rootPath: string): MigrationDetection {
  // 检测工作区配置（从 settings.json 文件）
  const wsResult = hasWorkspaceConfigInFile(rootPath)
  const hasWorkspaceConfig = wsResult.hasConfig
  const legacyNamespaces = [...wsResult.namespaces]
  // 检测全局配置（从 VS Code API）
  let hasGlobalConfig = false
  for (const ns of LEGACY_NAMESPACES) {
    const glConfig = hasConfigInNamespace(ns, 'globalValue')
    if (glConfig) {
      hasGlobalConfig = true
      if (!legacyNamespaces.includes(ns))
        legacyNamespaces.push(ns)
    }
  }
  // 检测旧版文件
  const hasLegacyFiles: string[] = []
  for (const oldFile of Object.keys(FILE_MIGRATIONS)) {
    const oldPath = path.join(rootPath, oldFile)
    if (fs.existsSync(oldPath))
      hasLegacyFiles.push(oldFile)
  }
  return { hasWorkspaceConfig, hasGlobalConfig, hasLegacyFiles, legacyNamespaces }
}

/** 是否为测试环境 */
const isTestEnv = process.env.I18N_ALLY_ENV === 'test'

/**
 * 执行迁移命令
 */
async function executeMigration(): Promise<void> {
  const rootPath = workspace.rootPath
  if (!rootPath) {
    window.showErrorMessage(i18n.t('migrate.no_workspace'))
    return
  }
  const detection = detectMigrationNeeded(rootPath)
  const hasAnything = detection.hasWorkspaceConfig || detection.hasGlobalConfig || detection.hasLegacyFiles.length > 0
  if (!hasAnything) {
    window.showInformationMessage(i18n.t('migrate.nothing_to_migrate'))
    return
  }
  // 显示确认对话框
  const items: string[] = []
  if (detection.hasWorkspaceConfig)
    items.push(i18n.t('migrate.will_migrate_config'))
  if (detection.hasGlobalConfig)
    items.push(i18n.t('migrate.will_migrate_global_config'))
  if (detection.hasLegacyFiles.length > 0)
    items.push(i18n.t('migrate.will_migrate_files', detection.hasLegacyFiles.join(', ')))
  if (detection.legacyNamespaces.length > 0)
    items.push(i18n.t('migrate.legacy_namespaces', detection.legacyNamespaces.join(', ')))
  if (!isTestEnv) {
    const confirm = await window.showWarningMessage(
      i18n.t('migrate.confirm_message'),
      { modal: true, detail: items.join('\n') },
      i18n.t('migrate.confirm_yes'),
      i18n.t('migrate.confirm_no'),
    )
    if (confirm !== i18n.t('migrate.confirm_yes'))
      return
  }
  const result: MigrationResult = {
    workspaceConfigMigrated: false,
    globalConfigMigrated: false,
    filesMigrated: [],
    errors: [],
  }
  // 迁移工作区配置
  if (detection.hasWorkspaceConfig) {
    const configResult = migrateWorkspaceConfigFromFile(rootPath)
    result.workspaceConfigMigrated = configResult.migrated
    if (configResult.migrated)
      Log.info(`📦 Migrated workspace config keys: ${configResult.keys.join(', ')}`)
  }
  // 迁移全局配置
  if (detection.hasGlobalConfig) {
    const globalResult = await migrateGlobalConfig()
    result.globalConfigMigrated = globalResult.migrated
    if (globalResult.migrated)
      Log.info(`📦 Migrated global config keys: ${globalResult.keys.join(', ')}`)
  }
  // 迁移文件
  if (detection.hasLegacyFiles.length > 0) {
    const fileResult = migrateFiles(rootPath)
    result.filesMigrated = fileResult.migrated
    result.errors = fileResult.errors
  }
  // 显示结果（测试环境下跳过 UI 提示）
  if (isTestEnv) {
    Log.info(`📦 Migration completed: config=${result.workspaceConfigMigrated || result.globalConfigMigrated}, files=${result.filesMigrated.length}`)
    return
  }
  const messages: string[] = []
  if (result.workspaceConfigMigrated || result.globalConfigMigrated)
    messages.push(i18n.t('migrate.config_migrated'))
  if (result.filesMigrated.length > 0)
    messages.push(i18n.t('migrate.files_migrated', result.filesMigrated.join(', ')))
  if (result.errors.length > 0) {
    window.showWarningMessage(i18n.t('migrate.completed_with_errors', result.errors.join('; ')))
  }
  else if (messages.length > 0) {
    const reload = await window.showInformationMessage(
      i18n.t('migrate.completed', messages.join('; ')),
      i18n.t('migrate.reload_window'),
    )
    if (reload === i18n.t('migrate.reload_window'))
      commands.executeCommand('workbench.action.reloadWindow')
  }
  else {
    window.showInformationMessage(i18n.t('migrate.nothing_to_migrate'))
  }
}

export default function (_ctx: ExtensionContext) {
  return [
    commands.registerCommand(Commands.migrate_from_i18n_ally, executeMigration),
  ]
}
