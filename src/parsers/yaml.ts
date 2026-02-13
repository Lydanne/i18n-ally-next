import type { KeyInDocument } from '~/core'
import YAML from 'js-yaml'
import { isMap, isPair, isScalar, isSeq, parseDocument } from 'yaml'
import { Config } from '~/core'
import { Parser } from './base'

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
    const doc = parseDocument(text, { keepSourceTokens: true })
    const results: KeyInDocument[] = []
    const collectPairs = (node: any, path: string[] = []) => {
      if (!node)
        return
      if (isMap(node)) {
        for (const item of node.items)
          collectPairs(item, path)
        return
      }
      if (isSeq(node)) {
        for (const item of node.items)
          collectPairs(item, path)
        return
      }
      if (isPair(node)) {
        const keyStr = String(node.key)
        if (isScalar(node.value)) {
          const range = node.value.range
          if (range) {
            results.push({
              start: range[0] + 1,
              end: range[1] - 1,
              key: [...path, keyStr].join('.'),
              quoted: true,
            })
          }
        }
        else {
          collectPairs(node.value, [...path, keyStr])
        }
      }
    }
    collectPairs(doc.contents)
    return results
  }
}
