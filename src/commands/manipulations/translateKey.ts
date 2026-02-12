import type { CommandOptions } from './common'
import type { AccaptableTranslateItem, LocaleNode } from '~/core'
import { window } from 'vscode'
import { Config, CurrentFile, Global, Translator } from '~/core'
import { Telemetry, TelemetryKey } from '~/core/Telemetry'
import i18n from '~/i18n'
import { LocaleTreeItem, ProgressSubmenuItem } from '~/views'
import { getNode, getNodeOrRecord } from './common'

export async function promptForSourceLocale(defaultLocale: string, node?: LocaleNode) {
  const locales = Global.allLocales
  const placeHolder = i18n.t('prompt.select_source_language_for_translating', defaultLocale)

  const result = await window.showQuickPick(locales
    .map(locale => ({
      label: locale,
      description: node?.getValue(locale),
    })), {
    placeHolder,
  })

  if (result == null)
    return undefined

  return result.label || defaultLocale
}

export async function TranslateKeys(
  item?: LocaleTreeItem | ProgressSubmenuItem | CommandOptions,
) {
  let source: string | undefined

  if (item && !(item instanceof LocaleTreeItem) && !(item instanceof ProgressSubmenuItem) && item.from) {
    source = item.from
  }
  else {
    const node = getNode(item)

    source = Config.sourceLanguage
    if (Config.translatePromptSource)
      source = await promptForSourceLocale(source, node)

    if (source == null)
      return
  }

  Telemetry.track(TelemetryKey.TranslateKey, { actionSource: Telemetry.getActionSource(item) })

  let nodes: AccaptableTranslateItem[] = []
  let targetLocales: string[] | undefined

  if (item instanceof ProgressSubmenuItem) {
    const to = item.node.locale
    nodes = item.getKeys()
      .map(key => CurrentFile.loader.getRecordByKey(key, to, true)!)
      .filter(i => i)
  }
  else {
    if (item instanceof LocaleTreeItem)
      targetLocales = item.listedLocales
    else
      targetLocales = item?.locales

    const node = getNodeOrRecord(item)
    if (node)
      nodes.push(node)
  }

  Translator.translateNodes(CurrentFile.loader, nodes, source, targetLocales)
}
