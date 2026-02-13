import type { KeyInDocument, RewriteKeyContext } from '../core/types'
import type { ScopeRange } from '../frameworks/base'
import { sortBy } from 'lodash'
import { Config, CurrentFile } from '~/core'
import i18n from '~/i18n'
import { Log } from '.'
import { QUOTE_SYMBOLS } from '../meta'

/**
 * 从正则匹配起始位置，跳过开头的非标识符字符，找到函数调用的真正起始位置
 * 例如正则匹配 " t('key'" 时，跳过开头的空格，返回 t 的位置
 */
function findCallExpressionStart(text: string, matchIndex: number, matchString: string): number {
  const parenIndex = matchString.indexOf('(')
  if (parenIndex < 0)
    return matchIndex
  let i = matchIndex + parenIndex - 1
  while (i >= matchIndex && /[\w.$]/.test(text[i]))
    i--
  return i + 1
}

/**
 * 从给定位置向后扫描，找到函数调用表达式的右括号位置
 * 处理嵌套括号和字符串内的括号
 */
function findCallExpressionEnd(text: string, pos: number): number {
  let depth = 1
  let i = pos
  while (i < text.length && depth > 0) {
    const ch = text[i]
    if (ch === '\'' || ch === '"' || ch === '`') {
      i++
      while (i < text.length && text[i] !== ch) {
        if (text[i] === '\\')
          i++
        i++
      }
    }
    else if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
      if (depth === 0)
        return i + 1
    }
    i++
  }
  return pos
}

export function handleRegexMatch(
  text: string,
  match: RegExpExecArray,
  dotEnding = false,
  rewriteContext?: RewriteKeyContext,
  scopes: ScopeRange[] = [],
  namespaceDelimiters = [':', '/'],
  defaultNamespace?: string,
  starts: number[] = [],
): KeyInDocument | undefined {
  const matchString = match[0]
  let key = match[1]
  if (!key)
    return

  const start = match.index + matchString.lastIndexOf(key)
  const end = start + key.length
  const fullMatchEnd = findCallExpressionEnd(text, match.index + matchString.length)
  const fullMatchStart = findCallExpressionStart(text, match.index, matchString)
  const scope = scopes.find(s => s.start <= start && s.end >= end)
  const quoted = QUOTE_SYMBOLS.includes(text[start - 1])

  const namespace = scope?.namespace || defaultNamespace

  // prevent duplicated detection when multiple frameworks enables at the same time.
  if (starts.includes(start))
    return

  starts.push(start)

  // prefix the namespace
  const hasExplicitNamespace = namespaceDelimiters.some(delimiter => key.includes(delimiter))

  if (!hasExplicitNamespace && namespace)
    key = `${namespace}.${key}`

  if (dotEnding || !key.endsWith('.')) {
    key = CurrentFile.loader.rewriteKeys(key, 'reference', {
      ...rewriteContext,
      namespace,
    })
    return {
      key,
      start,
      end,
      quoted,
      fullMatchStart,
      fullMatchEnd,
    }
  }
}

export function regexFindKeys(
  text: string,
  regs: RegExp[],
  dotEnding = false,
  rewriteContext?: RewriteKeyContext,
  scopes: ScopeRange[] = [],
  namespaceDelimiters?: string[],
): KeyInDocument[] {
  if (Config.disablePathParsing)
    dotEnding = true

  const defaultNamespace = Config.defaultNamespace
  const keys: KeyInDocument[] = []
  const starts: number[] = []

  for (const reg of regs) {
    let match = null
    reg.lastIndex = 0
    // eslint-disable-next-line no-cond-assign
    while (match = reg.exec(text)) {
      const key = handleRegexMatch(text, match, dotEnding, rewriteContext, scopes, namespaceDelimiters, defaultNamespace, starts)
      if (key)
        keys.push(key)
    }
  }

  return sortBy(keys, i => i.start)
}

export function normalizeUsageMatchRegex(reg: (string | RegExp)[]): RegExp[] {
  return reg.map((i) => {
    if (typeof i === 'string') {
      try {
        const interpated = i.replace(/\{key\}/g, Config.regexKey)
        return new RegExp(interpated, 'gm')
      }
      catch (e) {
        Log.error(i18n.t('prompt.error_on_parse_custom_regex', i), true)
        Log.error(e, false)
        return undefined
      }
    }
    return i
  })
    .filter(i => i) as RegExp[]
}
