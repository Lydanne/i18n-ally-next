import { parse } from '@vue/compiler-sfc'
import YAML from 'js-yaml'
import JSON5 from 'json5'

export interface VueSfcMessageSection {
  lang: string
  locale?: string
  messages: Record<string, any>
  start: number
  end: number
  originalContent: string
}

export function parseVueSfcMessages(source: string, filename: string): VueSfcMessageSection[] {
  const { descriptor } = parse(source, { filename, sourceMap: false })
  return descriptor.customBlocks
    .filter(block => block.type === 'i18n' && !block.src)
    .map((block) => {
      const lang = typeof block.lang === 'string' ? block.lang : 'json'
      const locale = typeof block.attrs.locale === 'string' ? block.attrs.locale : undefined
      const content = block.content
      let parsed: unknown = {}
      if (content.trim()) {
        if (lang === 'yaml' || lang === 'yml')
          parsed = YAML.load(content)
        else if (lang === 'json5')
          parsed = JSON5.parse(content)
        else
          parsed = JSON.parse(content)
      }
      if (parsed == null)
        parsed = {}
      if (typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error(`Invalid i18n block in ${filename}: expected an object`)
      const messages = locale ? { [locale]: parsed } : parsed as Record<string, any>
      return { lang, locale, messages, start: block.loc.start.offset, end: block.loc.end.offset, originalContent: content }
    })
}

export function renderVueSfcMessages(source: string, sections: VueSfcMessageSection[]): string {
  const eol = source.includes('\r\n') ? '\r\n' : '\n'
  for (const section of [...sections].sort((a, b) => b.start - a.start)) {
    const content = section.locale ? section.messages[section.locale] : section.messages
    let serialized: string
    if (section.lang === 'yaml' || section.lang === 'yml')
      serialized = YAML.dump(content, { indent: 2 })
    else if (section.lang === 'json5')
      serialized = JSON5.stringify(content, null, 2)
    else
      serialized = JSON.stringify(content, null, 2)
    serialized = `${serialized.replace(/\r?\n/g, '\n').replace(/\n*$/, '')}\n`
    const replacement = `\n${serialized}`.replace(/\n/g, eol)
    source = `${source.slice(0, section.start)}${replacement}${source.slice(section.end)}`
  }
  return source
}
