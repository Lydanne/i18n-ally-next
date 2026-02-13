import type { ExtensionModule } from '~/modules'
import { commands, ProgressLocation, window } from 'vscode'
import { Commands } from '~/commands'
import { Config, CurrentFile, Global, Translator } from '~/core'
import { Telemetry, TelemetryKey } from '~/core/Telemetry'
import i18n from '~/i18n'

interface StaleEntry {
  readonly keypath: string
  readonly oldSourceText: string
  readonly newSourceText: string
}

/**
 * 检测过期翻译：对比源语言快照与当前值，找出已变更的 key
 */
function detectStaleEntries(): StaleEntry[] {
  const loader = CurrentFile.loader
  const sourceLanguage = Config.sourceLanguage
  const reviews = Global.reviews
  const allKeys = loader.keys
  const staleEntries: StaleEntry[] = []
  for (const key of allKeys) {
    const snapshot = reviews.getSourceSnapshot(key)
    if (!snapshot)
      continue
    const currentValue = loader.getValueByKey(key, sourceLanguage) || ''
    if (snapshot.text !== currentValue) {
      staleEntries.push({
        keypath: key,
        oldSourceText: snapshot.text,
        newSourceText: currentValue,
      })
    }
  }
  return staleEntries
}

/**
 * 更新所有 key 的源语言快照
 */
async function updateAllSnapshots(): Promise<void> {
  const loader = CurrentFile.loader
  const sourceLanguage = Config.sourceLanguage
  const allKeys = loader.keys
  const snapshots = allKeys
    .map((key) => {
      const value = loader.getValueByKey(key, sourceLanguage) || ''
      return { key, text: value }
    })
    .filter(s => s.text)
  await Global.reviews.updateSourceSnapshots(snapshots)
}

/**
 * 检查过期翻译并提供逐个/全部重新翻译的选项
 */
export async function CheckStaleTranslations() {
  await window.withProgress({
    location: ProgressLocation.Notification,
    title: i18n.t('prompt.stale_checking'),
    cancellable: false,
  }, async () => {
    const staleEntries = detectStaleEntries()
    if (!staleEntries.length) {
      const initSnapshot = i18n.t('prompt.stale_init_snapshot')
      const result = await window.showInformationMessage(
        i18n.t('prompt.stale_no_results'),
        initSnapshot,
      )
      if (result === initSnapshot)
        await updateAllSnapshots()
      return
    }
    const translateAll = i18n.t('prompt.stale_translate_all')
    const translateOneByOne = i18n.t('prompt.stale_translate_one_by_one')
    const updateSnapshot = i18n.t('prompt.stale_update_snapshot')
    const choice = await window.showWarningMessage(
      i18n.t('prompt.stale_found', staleEntries.length),
      { modal: true },
      translateAll,
      translateOneByOne,
      updateSnapshot,
    )
    if (!choice)
      return
    if (choice === updateSnapshot) {
      await updateAllSnapshots()
      window.showInformationMessage(i18n.t('prompt.stale_snapshot_updated'))
      return
    }
    if (choice === translateAll) {
      await translateStaleKeys(staleEntries)
      await updateAllSnapshots()
      return
    }
    if (choice === translateOneByOne) {
      await translateStaleKeysOneByOne(staleEntries)
      await updateAllSnapshots()
    }
  })
}

async function translateStaleKeys(entries: StaleEntry[]): Promise<void> {
  const loader = CurrentFile.loader
  const sourceLanguage = Config.sourceLanguage
  const targetLocales = Global.visibleLocales.filter(l => l !== sourceLanguage)
  const nodes: { locale: string, keypath: string, type: undefined }[] = []
  for (const entry of entries) {
    for (const locale of targetLocales) {
      const record = loader.getRecordByKey(entry.keypath, locale)
      if (record?.value)
        nodes.push({ locale, keypath: entry.keypath, type: undefined })
    }
  }
  if (!nodes.length) {
    window.showInformationMessage(i18n.t('prompt.translate_no_jobs'))
    return
  }
  Telemetry.track(TelemetryKey.TranslateKey, { actionSource: 'stale_translate_all', count: nodes.length })
  await Translator.translateNodes(loader, nodes, sourceLanguage)
}

async function translateStaleKeysOneByOne(entries: StaleEntry[]): Promise<void> {
  const loader = CurrentFile.loader
  const sourceLanguage = Config.sourceLanguage
  const targetLocales = Global.visibleLocales.filter(l => l !== sourceLanguage)
  for (const entry of entries) {
    const affectedLocales = targetLocales.filter((locale) => {
      const record = loader.getRecordByKey(entry.keypath, locale)
      return !!record?.value
    })
    if (!affectedLocales.length)
      continue
    const yes = i18n.t('prompt.stale_retranslate')
    const skip = i18n.t('prompt.stale_skip')
    const stopAll = i18n.t('prompt.stale_stop')
    const result = await window.showInformationMessage(
      i18n.t('prompt.stale_key_changed', entry.keypath, entry.oldSourceText, entry.newSourceText),
      { modal: true },
      yes,
      skip,
      stopAll,
    )
    if (result === stopAll)
      break
    if (result === skip || !result)
      continue
    if (result === yes) {
      const nodes = affectedLocales.map(locale => ({
        locale,
        keypath: entry.keypath,
        type: undefined as undefined,
      }))
      Telemetry.track(TelemetryKey.TranslateKey, { actionSource: 'stale_translate_one', count: nodes.length })
      await Translator.translateNodes(loader, nodes, sourceLanguage)
    }
  }
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.check_stale_translations, CheckStaleTranslations),
  ]
}

export default m
