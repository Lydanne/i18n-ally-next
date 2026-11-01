import type { LocaleRecord } from '~/core'
import path from 'path'
import { slash } from '@antfu/utils'
import { MarkdownString, workspace } from 'vscode'
import { Commands } from '~/commands'
import { ActionSource, Analyst, Config, CurrentFile, Global } from '~/core'
import i18n from '~/i18n'
import { decorateLocale, escapeMarkdown, NodeHelper } from '~/utils'

const EmptyButton = '⠀⠀'
const MAX_HOVER_OCCURRENCES = 8

function makeMarkdownCommand(command: Commands, args: any): string {
  return `command:${command}?${encodeURIComponent(JSON.stringify({ actionSource: ActionSource.Hover, ...args }))}`
}

function formatValue(text: string) {
  return escapeMarkdown(text.replace(/\s+/g, ' '))
}

function getAvaliableCommands(record?: LocaleRecord, keyIndex?: number) {
  const commands = []

  if (record) {
    const { keypath, locale } = record

    if (Config.reviewEnabled) {
      commands.push({
        text: i18n.t('command.open_review'),
        icon: '💬', // '$(comment-discussion)' // AWAIT_VSCODE_FIX
        command: makeMarkdownCommand(Commands.open_in_editor, { keypath, locale, keyIndex }),
      })
    }

    if (NodeHelper.isTranslatable(record)) {
      commands.push({
        text: i18n.t('command.translate_key'),
        icon: '🌏', // '$(globe)' // AWAIT_VSCODE_FIX
        command: makeMarkdownCommand(Commands.translate_key, { keypath, locale }),
      })
    }

    if (NodeHelper.isEditable(record)) {
      commands.push({
        text: i18n.t('command.edit_key'),
        icon: '✏️', // '$(edit)' // AWAIT_VSCODE_FIX
        command: Config.preferEditor
          ? makeMarkdownCommand(Commands.open_in_editor, { keypath, locale, keyIndex })
          : makeMarkdownCommand(Commands.edit_key, { keypath, locale }),
      })
    }
    else {
      commands.push(EmptyButton)
    }

    if (NodeHelper.isOpenable(record)) {
      commands.push({
        text: i18n.t('command.open_key'),
        icon: '↗️', // '$(link-external)' // AWAIT_VSCODE_FIX
        command: makeMarkdownCommand(Commands.open_key, { keypath, locale }),
      })
    }
    else {
      commands.push(EmptyButton)
    }
  }

  return commands
}

export function createTable(visibleLocales: string[], records: Record<string, LocaleRecord>, maxLength = 0, keyIndex?: number) {
  const transTable = visibleLocales
    .flatMap((locale) => {
      const record = records[locale]
      if (!record)
        return []

      const row = {
        locale: decorateLocale(locale),
        value: formatValue(CurrentFile.loader.getValueByKey(record.keypath, locale, maxLength) || '-'),
        commands: '',
      }
      const commands = getAvaliableCommands(record, keyIndex)
      row.commands = commands
        .map(c => typeof c === 'string' ? c : `[${c.icon}](${c.command} "${c.text}")`)
        .join(' ')
      return [row]
    })
    .map(item => `| | **${item.locale}** | | ${item.value} | ${item.commands} |`)
    .join('\n')

  if (!transTable)
    return ''

  return `| | | | | |\n|---|---:|---|---|---:|\n${transTable}\n| | | | | |`
}

export async function createHover(keypath: string, maxLength = 0, mainLocale?: string, keyIndex?: number, showUsages = false) {
  const loader = CurrentFile.loader
  const records = loader.getTranslationsByKey(keypath, undefined)
  if (!Object.keys(records).length)
    return undefined

  mainLocale = mainLocale || Config.displayLanguage

  const locales = Global.visibleLocales.filter(i => i !== mainLocale)
  const table1 = createTable([mainLocale, ...locales], records, maxLength, keyIndex)
  let markdown = `${table1}`

  if (showUsages) {
    const occurrences = await Analyst.getAllOccurrences(keypath)
    const root = Global.rootpath || ''
    if (occurrences.length > 0) {
      markdown += `\n\n---\n\n**${i18n.t('hover.usages', occurrences.length)}**:\n\n`
      const displayOccurrences = occurrences.slice(0, MAX_HOVER_OCCURRENCES)
      for (const occ of displayOccurrences) {
        let relPath = slash(path.relative(root, occ.filepath))
        if (!relPath.startsWith('.'))
          relPath = `./${relPath}`
        const doc = workspace.textDocuments.find(d => d.uri.fsPath === occ.filepath)
        const line = occ.line || (doc ? doc.positionAt(occ.start).line + 1 : 1)
        const args = { filepath: occ.filepath, start: occ.start, end: occ.end }
        const openCmd = `command:${Commands.go_to_location}?${encodeURIComponent(JSON.stringify(args))}`
        const escapedPath = `${relPath}:${line}`
          .replace(/\r?\n/g, ' ')
          .replace(/([\\`*_{}#+\-.!])/g, '\\$1')
        const label = escapeMarkdown(escapedPath)
        markdown += `- [📄 ${label}](${openCmd})\n`
      }
      if (occurrences.length > MAX_HOVER_OCCURRENCES) {
        const moreCmd = `command:${Commands.show_key_references}?${encodeURIComponent(JSON.stringify({ keypath }))}`
        markdown += `\n[${i18n.t('hover.more_references', occurrences.length - MAX_HOVER_OCCURRENCES)}](${moreCmd})\n`
      }
    }
    else {
      markdown += `\n\n---\n\n*$(circle-slash) ${i18n.t('hover.no_usages')}*`
    }
  }

  const markdownText = new MarkdownString(`${markdown}`, true)
  markdownText.isTrusted = {
    enabledCommands: [
      Commands.open_in_editor,
      Commands.translate_key,
      Commands.edit_key,
      Commands.open_key,
      Commands.go_to_location,
      Commands.show_key_references,
    ],
  }

  return markdownText
}

/**
 * There should be a table
 *
 * | A | B |
 * |---|---|
 * | Hello | World |
 *
 * But nothing is rendered
 */
function a() {

}

a()
