import type { ExtractionRule } from '../rules'
import type { ExtractionPythonOptions } from './options'
import type { DetectionResult, DetectionSource, NamedInterpolationArgument } from '~/core/types'
import { parser } from '@lezer/python'
import { DefaultExtractionRules } from '../rules'
import { shouldExtract } from '../shouldExtract'

type PythonSyntaxNode = ReturnType<typeof parser.parse>['topNode']

export const DEFAULT_PYTHON_IGNORED_CALLS = [
  '_',
  'gettext',
  'ngettext',
  'pgettext',
  'npgettext',
  'dgettext',
  'dngettext',
  'dpgettext',
  'dnpgettext',
  'ugettext',
  'ungettext',
  '__import__',
  'importlib.import_module',
  'Path',
  'pathlib.Path',
  'PurePath',
  'pathlib.PurePath',
  'PurePosixPath',
  'pathlib.PurePosixPath',
  'PureWindowsPath',
  'pathlib.PureWindowsPath',
  'os.path.join',
  'os.path.abspath',
  'os.path.basename',
  'os.path.dirname',
  'os.path.normpath',
  'os.path.realpath',
  're.compile',
  'getattr',
  'setattr',
  'hasattr',
  'delattr',
  'eval',
  'exec',
  'compile',
] as const

const PYTHON_KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
])

const IDENTIFIER_RE = /^[\p{ID_Start}_]\p{ID_Continue}*$/u
const STRING_NODE_NAMES = new Set(['String', 'FormatString', 'ContinuedString'])

interface LiteralToken {
  contentFrom: number
  contentTo: number
  content: string
  isBytes: boolean
  isFormat: boolean
  isRaw: boolean
}

export interface ParsedPythonString {
  text: string
  namedArgs: NamedInterpolationArgument[]
  source: Extract<DetectionSource, 'python-string' | 'python-fstring'>
}

class InterpolationNames {
  readonly args: NamedInterpolationArgument[] = []
  private readonly used = new Set<string>()
  private readonly simpleVariables = new Map<string, string>()

  add(expressionNode: PythonSyntaxNode, expression: string): string {
    const simple = expressionNode.name === 'VariableName' && isValidPlaceholder(expression)
    if (simple) {
      const existing = this.simpleVariables.get(expression)
      if (existing)
        return existing
    }

    let base = 'value'
    if (simple) {
      base = expression
    }
    else if (expressionNode.name === 'MemberExpression') {
      const parts = children(expressionNode)
      const property = parts.at(-1)
      const propertyName = property?.name === 'PropertyName' ? expression.slice(property.from - expressionNode.from) : ''
      if (isValidPlaceholder(propertyName))
        base = propertyName
    }

    const name = this.unique(base)
    this.args.push({
      name,
      expression,
      order: this.args.length,
    })
    if (simple)
      this.simpleVariables.set(expression, name)
    return name
  }

  private unique(base: string): string {
    if (!isValidPlaceholder(base))
      base = 'value'
    if (!this.used.has(base)) {
      this.used.add(base)
      return base
    }
    let index = 2
    while (this.used.has(`${base}${index}`))
      index++
    const result = `${base}${index}`
    this.used.add(result)
    return result
  }
}

export function detect(
  input: string,
  rules: ExtractionRule[] = DefaultExtractionRules,
  userOptions: ExtractionPythonOptions = {},
): DetectionResult[] {
  const ignoredCalls = userOptions.ignoredCalls ?? [...DEFAULT_PYTHON_IGNORED_CALLS]
  const tree = parser.parse(input)
  const detections: DetectionResult[] = []

  visit(tree.topNode, (node) => {
    if (!isOutermostString(node) || isIgnoredContext(node, input, ignoredCalls))
      return

    const parsed = parseStringNode(node, input)
    if (!parsed)
      return

    const ruleText = (parsed.namedArgs.length ? maskFormatPlaceholders(parsed.text) : parsed.text).replace(/\s+/g, ' ')
    if (!shouldExtract(ruleText, rules))
      return

    detections.push({
      text: parsed.text,
      translationText: parsed.text,
      namedArgs: parsed.namedArgs,
      source: parsed.source,
      isDynamic: parsed.namedArgs.length > 0,
      start: node.from,
      end: node.to,
      fullStart: node.from,
      fullEnd: node.to,
      fullText: input.slice(node.from, node.to),
      preserveRange: true,
    })
  })

  return detections
}

/** Parse a selected Python literal without applying contextual extraction filters. */
export function parseStringExpression(input: string): ParsedPythonString | undefined {
  const tree = parser.parse(input)
  let result: ParsedPythonString | undefined
  visit(tree.topNode, (node) => {
    if (!result && isOutermostString(node))
      result = parseStringNode(node, input)
  })
  return result
}

function parseStringNode(node: PythonSyntaxNode, input: string): ParsedPythonString | undefined {
  if (hasParseError(node))
    return undefined

  const parts = node.name === 'ContinuedString'
    ? children(node).filter(child => child.name === 'String' || child.name === 'FormatString')
    : [node]
  if (!parts.length)
    return undefined

  const names = new InterpolationNames()
  let text = ''
  let hasFormatString = false

  for (const part of parts) {
    const token = parseLiteralToken(part, input)
    if (!token || token.isBytes)
      return undefined

    if (token.isFormat) {
      hasFormatString = true
      const replacements = children(part).filter(child => child.name === 'FormatReplacement')
      let offset = token.contentFrom
      for (const replacement of replacements) {
        text += decodePythonEscapes(input.slice(offset, replacement.from), token.isRaw)
        const replacementText = parseFormatReplacement(replacement, input, names)
        if (replacementText == null)
          return undefined
        text += replacementText
        offset = replacement.to
      }
      text += decodePythonEscapes(input.slice(offset, token.contentTo), token.isRaw)
    }
    else {
      text += decodePythonEscapes(token.content, token.isRaw)
    }
  }

  return {
    text: hasFormatString && !names.args.length ? collapseEscapedFormatBraces(text) : text,
    namedArgs: names.args,
    source: hasFormatString ? 'python-fstring' : 'python-string',
  }
}

function parseFormatReplacement(
  node: PythonSyntaxNode,
  input: string,
  names: InterpolationNames,
): string | undefined {
  const parts = children(node)
  const expressionNode = parts.find(part => ![
    '{',
    '}',
    'FormatConversion',
    'FormatSpec',
    'FormatSelfDoc',
  ].includes(part.name))
  if (!expressionNode)
    return undefined

  const expression = input.slice(expressionNode.from, expressionNode.to).trim()
  if (!expression)
    return undefined
  const placeholder = names.add(expressionNode, expression)
  const conversion = parts.find(part => part.name === 'FormatConversion')
  const formatSpec = parts.find(part => part.name === 'FormatSpec')
  const selfDoc = parts.find(part => part.name === 'FormatSelfDoc')

  let spec = ''
  if (formatSpec) {
    let offset = formatSpec.from
    for (const nested of children(formatSpec).filter(part => part.name === 'FormatReplacement')) {
      spec += input.slice(offset, nested.from)
      const nestedText = parseFormatReplacement(nested, input, names)
      if (nestedText == null)
        return undefined
      spec += nestedText
      offset = nested.to
    }
    spec += input.slice(offset, formatSpec.to)
  }

  let conversionText = conversion ? input.slice(conversion.from, conversion.to) : ''
  let prefix = ''
  if (selfDoc) {
    prefix = input.slice(expressionNode.from, selfDoc.to)
    if (!conversionText && !formatSpec)
      conversionText = '!r'
  }

  return `${prefix}{${placeholder}${conversionText}${spec}}`
}

function parseLiteralToken(node: PythonSyntaxNode, input: string): LiteralToken | undefined {
  const raw = input.slice(node.from, node.to)
  const match = raw.match(/^([A-Z]*)("""|'''|"|')/i)
  if (!match)
    return undefined

  const prefix = match[1]
  const delimiter = match[2]
  const normalizedPrefix = prefix.toLowerCase()
  const validPrefix = ['', 'r', 'u', 'f', 'fr', 'rf', 'b', 'br', 'rb'].includes(normalizedPrefix)
  if (!validPrefix || raw.length < match[0].length + delimiter.length || !raw.endsWith(delimiter))
    return undefined

  const contentFrom = node.from + match[0].length
  const contentTo = node.to - delimiter.length
  return {
    contentFrom,
    contentTo,
    content: input.slice(contentFrom, contentTo),
    isBytes: normalizedPrefix.includes('b'),
    isFormat: node.name === 'FormatString' || normalizedPrefix.includes('f'),
    isRaw: normalizedPrefix.includes('r'),
  }
}

function decodePythonEscapes(value: string, raw: boolean): string {
  if (raw || !value.includes('\\'))
    return value

  const simple: Record<string, string> = {
    '\\': '\\',
    '\'': '\'',
    '"': '"',
    'a': '\u0007',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t',
    'v': '\v',
  }
  let output = ''
  for (let index = 0; index < value.length; index++) {
    const char = value[index]
    if (char !== '\\' || index === value.length - 1) {
      output += char
      continue
    }

    const escaped = value[++index]
    if (escaped === '\n')
      continue
    if (escaped === '\r' && value[index + 1] === '\n') {
      index++
      continue
    }
    if (simple[escaped] != null) {
      output += simple[escaped]
      continue
    }

    if (/[0-7]/.test(escaped)) {
      let digits = escaped
      while (digits.length < 3 && /[0-7]/.test(value[index + 1] || ''))
        digits += value[++index]
      output += String.fromCodePoint(Number.parseInt(digits, 8))
      continue
    }

    const unicodeLength = escaped === 'x' ? 2 : escaped === 'u' ? 4 : escaped === 'U' ? 8 : 0
    if (unicodeLength) {
      const digits = value.slice(index + 1, index + 1 + unicodeLength)
      if (digits.length === unicodeLength && /^[\da-f]+$/i.test(digits)) {
        const codePoint = Number.parseInt(digits, 16)
        if (codePoint <= 0x10FFFF) {
          output += String.fromCodePoint(codePoint)
          index += unicodeLength
          continue
        }
      }
    }

    // Python preserves unknown escapes (and currently emits a warning).
    output += `\\${escaped}`
  }
  return output
}

function isIgnoredContext(node: PythonSyntaxNode, input: string, ignoredCalls: readonly string[]): boolean {
  if (node.parent?.name === 'ExpressionStatement')
    return true

  for (let current: PythonSyntaxNode | null = node; current; current = current.parent) {
    if (current.parent?.name === 'DictionaryExpression' && current.nextSibling?.name === ':')
      return true
    if (current.name === 'ImportStatement' || current.name === 'TypeDef' || current.name === 'LiteralPattern')
      return true
    if (current.name === 'CallExpression') {
      const callName = getCallName(current, input)
      if (callName && ignoredCalls.some(ignored => matchesCallName(callName, ignored)))
        return true
    }
  }
  return false
}

function collapseEscapedFormatBraces(value: string): string {
  return value.replace(/\{\{|\}\}/g, brace => brace[0])
}

function getCallName(node: PythonSyntaxNode, input: string): string | undefined {
  const args = children(node).find(child => child.name === 'ArgList')
  if (!args)
    return undefined
  const name = input.slice(node.from, args.from).replace(/\s+/g, '')
  return name || undefined
}

function matchesCallName(callName: string, ignored: string): boolean {
  if (callName === ignored)
    return true
  return !ignored.includes('.') && callName.endsWith(`.${ignored}`)
}

function maskFormatPlaceholders(value: string): string {
  let result = ''
  for (let index = 0; index < value.length;) {
    if (value[index] !== '{' || value[index + 1] === '{') {
      const escapedBrace = (value[index] === '{' && value[index + 1] === '{')
        || (value[index] === '}' && value[index + 1] === '}')
      result += escapedBrace ? value.slice(index, index + 2) : value[index]
      index += escapedBrace ? 2 : 1
      continue
    }

    let depth = 1
    index++
    while (index < value.length && depth > 0) {
      if (value[index] === '{')
        depth++
      else if (value[index] === '}')
        depth--
      index++
    }
    result += ' interpolation'
  }
  return result
}

function isOutermostString(node: PythonSyntaxNode): boolean {
  if (!STRING_NODE_NAMES.has(node.name))
    return false
  if (node.parent?.name === 'ContinuedString')
    return false
  for (let current = node.parent; current; current = current.parent) {
    if (current.name === 'FormatReplacement')
      return false
  }
  return true
}

function isValidPlaceholder(value: string): boolean {
  return IDENTIFIER_RE.test(value) && !PYTHON_KEYWORDS.has(value)
}

function hasParseError(node: PythonSyntaxNode): boolean {
  if (node.type.isError)
    return true
  return children(node).some(hasParseError)
}

function children(node: PythonSyntaxNode): PythonSyntaxNode[] {
  const result: PythonSyntaxNode[] = []
  for (let child = node.firstChild; child; child = child.nextSibling)
    result.push(child)
  return result
}

function visit(node: PythonSyntaxNode, callback: (node: PythonSyntaxNode) => void): void {
  callback(node)
  for (const child of children(node))
    visit(child, callback)
}
