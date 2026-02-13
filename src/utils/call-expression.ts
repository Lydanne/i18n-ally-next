/**
 * 从正则匹配起始位置，跳过开头的非标识符字符，找到函数调用的真正起始位置
 * 例如正则匹配 " t('key'" 时，跳过开头的空格，返回 t 的位置
 */
export function findCallExpressionStart(text: string, matchIndex: number, matchString: string): number {
  const parenIndex = matchString.lastIndexOf('(')
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
export function findCallExpressionEnd(text: string, pos: number): number {
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
