import SortedStringify from 'json-stable-stringify'
import { Parser } from './base'
import { parseJsonLocaleAst } from './localeAst'

export class JsonParser extends Parser {
  id = 'json'

  constructor() {
    super(['json'], 'json')
  }

  async parse(text: string) {
    if (!text || !text.trim())
      return {}
    return JSON.parse(text)
  }

  async dump(object: object, sort: boolean, compare: ((x: string, y: string) => number) | undefined) {
    const indent = this.options.tab === '\t' ? this.options.tab : this.options.indent

    if (sort)
      return `${SortedStringify(object, { space: indent, cmp: compare ? (a, b) => compare(a.key, b.key) : undefined })}\n`
    else
      return `${JSON.stringify(object, null, indent)}\n`
  }

  annotationSupported = true
  annotationLanguageIds = ['json']

  parseAST(text: string) {
    return parseJsonLocaleAst(text)
  }
}
