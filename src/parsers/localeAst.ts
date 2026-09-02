import type { KeyInDocument } from '../core/types'
// @ts-ignore
import JsonMap from 'json-source-map'
import { isMap, isPair, isScalar, isSeq, parseDocument } from 'yaml'

export function parseJsonLocaleAst(text: string): KeyInDocument[] {
  if (!text || !text.trim())
    return []

  const map = JsonMap.parse(text).pointers
  return Object.entries<any>(map)
    .filter(([pointer]) => pointer)
    .map(([pointer, location]) => {
      const keyRange = location.key && location.keyEnd
        ? { keyStart: location.key.pos + 1, keyEnd: location.keyEnd.pos - 1 }
        : {}

      return {
        quoted: true,
        start: location.value.pos + 1,
        end: location.valueEnd.pos - 1,
        ...keyRange,
        key: pointer.slice(1)
          .replace(/\//g, '.')
          .replace(/~0/g, '~')
          .replace(/~1/g, '/'),
      }
    })
}

export function parseYamlLocaleAst(text: string): KeyInDocument[] {
  const doc = parseDocument(text, { keepSourceTokens: true })
  const results: KeyInDocument[] = []

  const collectPairs = (node: any, path: string[] = []) => {
    if (!node)
      return
    if (isMap(node) || isSeq(node)) {
      for (const item of node.items)
        collectPairs(item, path)
      return
    }
    if (!isPair(node))
      return
    if (!isScalar(node.key))
      return

    const key = String(node.key)
    if (!isScalar(node.value)) {
      collectPairs(node.value, [...path, key])
      return
    }

    const valueRange = node.value.range
    const keyRange = node.key?.range
    if (!valueRange || !keyRange)
      return

    const keyQuoted = node.key.type === 'QUOTE_DOUBLE' || node.key.type === 'QUOTE_SINGLE'
    results.push({
      start: valueRange[0] + 1,
      end: valueRange[1] - 1,
      keyStart: keyRange[0] + (keyQuoted ? 1 : 0),
      keyEnd: keyRange[1] - (keyQuoted ? 1 : 0),
      key: [...path, key].join('.'),
      quoted: true,
    })
  }

  collectPairs(doc.contents)
  return results
}
