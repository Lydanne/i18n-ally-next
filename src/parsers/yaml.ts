import YAML from 'js-yaml'
import { Config } from '~/core'
import { Parser } from './base'
import { parseYamlLocaleAst } from './localeAst'

export class YamlParser extends Parser {
  id = 'yaml'

  constructor() {
    super(['yaml'], 'ya?ml')
  }

  async parse(text: string) {
    return YAML.load(text, Config.parserOptions?.yaml?.load) as object
  }

  async dump(object: object, sort: boolean, compare: ((x: string, y: string) => number) | undefined) {
    object = JSON.parse(JSON.stringify(object))
    return YAML.dump(object, {
      indent: this.options.indent,
      sortKeys: sort ? (compare ?? true) : false,
      ...Config.parserOptions?.yaml?.dump,
    })
  }

  annotationSupported = true
  annotationLanguageIds = ['yaml']

  parseAST(text: string) {
    return parseYamlLocaleAst(text)
  }
}
