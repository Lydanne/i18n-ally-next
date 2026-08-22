import type { CaseStyles } from './changeCase'
import limax from 'limax'
import { nanoid } from 'nanoid'
import { changeCase } from './changeCase'

export type TemplateWithKeygenStrategy = 'slug' | 'random' | 'source'

export function generateSlugKey(text: string, separator: string, maxLength = Infinity): string {
  return limax(text.replace(/\$/g, ''), { separator, tone: false })
    .slice(0, maxLength)
}

/**
 * Join a template-derived prefix with a generated key. A template may provide
 * its own trailing separator; otherwise a dot is used to create a key path.
 */
export function joinTemplateWithGeneratedKey(prefix: string, generatedKey: string): string {
  prefix = prefix.trim()
  generatedKey = generatedKey.trim()

  if (!prefix)
    return generatedKey
  if (!generatedKey)
    return prefix

  return /[.:/_-]$/.test(prefix)
    ? `${prefix}${generatedKey}`
    : `${prefix}.${generatedKey}`
}

export function generateTemplateWithKeygenKey(
  prefix: string,
  text: string,
  separator: string,
  style: CaseStyles,
  maxLength = Infinity,
  strategy: TemplateWithKeygenStrategy = 'slug',
  randomKey: () => string = nanoid,
): string {
  const candidate = strategy === 'random'
    ? randomKey()
    : strategy === 'source'
      ? text
      : generateSlugKey(text, separator, maxLength)
  const generatedKey = changeCase(candidate, style)
  return joinTemplateWithGeneratedKey(prefix, generatedKey)
}
