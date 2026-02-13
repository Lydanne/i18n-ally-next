import type { ExtensionModule } from '~/modules'
import { commands, window } from 'vscode'
import { Commands } from '~/commands'
import { Config, CurrentFile, Global, Translator } from '~/core'
import { Telemetry, TelemetryKey } from '~/core/Telemetry'
import i18n from '~/i18n'
import { ProgressRootItem } from '~/views'

/**
 * 获取指定语言的过期 key 列表
 */
function getStaleKeys(locale: string, sourceLanguage: string): string[] {
  const loader = CurrentFile.loader
  const reviews = Global.reviews
  const staleKeys: string[] = []
  for (const key of loader.keys) {
    const snapshot = reviews.getSourceSnapshot(key)
    if (!snapshot)
      continue
    const currentValue = loader.getValueByKey(key, sourceLanguage) || ''
    if (snapshot.text !== currentValue) {
      const record = loader.getRecordByKey(key, locale)
      if (record?.value)
        staleKeys.push(key)
    }
  }
  return staleKeys
}

/**
 * 一键翻译指定语言所有缺失和过期的 key
 */
export async function TranslateAllMissing(item?: ProgressRootItem) {
  const loader = CurrentFile.loader
  const sourceLanguage = Config.sourceLanguage
  let targetLocales: string[]

  if (item instanceof ProgressRootItem) {
    targetLocales = [item.locale]
  }
  else {
    const locales = Global.visibleLocales.filter(l => l !== sourceLanguage)
    const picked = await window.showQuickPick(
      locales.map(locale => ({
        label: locale,
        description: loader.getCoverage(locale)?.translated
          ? `${((loader.getCoverage(locale)!.translated / loader.getCoverage(locale)!.total) * 100).toFixed(1)}%`
          : '',
      })),
      {
        placeHolder: i18n.t('prompt.translate_all_missing_select_locale'),
        canPickMany: true,
      },
    )
    if (!picked?.length)
      return
    targetLocales = picked.map(p => p.label)
  }

  const nodeSet = new Set<string>()
  const nodes: { locale: string, keypath: string, type: undefined }[] = []
  for (const locale of targetLocales) {
    const cov = loader.getCoverage(locale)
    if (!cov)
      continue
    const untranslatedKeys = [...cov.missingKeys, ...cov.emptyKeys]
    for (const key of untranslatedKeys) {
      const id = `${locale}::${key}`
      if (!nodeSet.has(id)) {
        nodeSet.add(id)
        nodes.push({ locale, keypath: key, type: undefined })
      }
    }
    const staleKeys = getStaleKeys(locale, sourceLanguage)
    for (const key of staleKeys) {
      const id = `${locale}::${key}`
      if (!nodeSet.has(id)) {
        nodeSet.add(id)
        nodes.push({ locale, keypath: key, type: undefined })
      }
    }
  }

  if (!nodes.length) {
    window.showInformationMessage(i18n.t('prompt.translate_no_jobs'))
    return
  }

  Telemetry.track(TelemetryKey.TranslateKey, { actionSource: 'translate_all_missing', count: nodes.length })
  Translator.translateNodes(loader, nodes, sourceLanguage)
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.translate_all_missing, TranslateAllMissing),
  ]
}

export default m
