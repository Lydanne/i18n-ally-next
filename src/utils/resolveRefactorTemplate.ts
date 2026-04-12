import type { CustomRefactorTemplate } from '~/core/types'

export function resolveRefactorTemplate(arr: (string | CustomRefactorTemplate & { template?: string })[] = []): CustomRefactorTemplate[] {
  return arr.map((i) => {
    if (typeof i === 'string') {
      return {
        templates: [i],
      }
    }
    const templates = [...(i.templates || [])]
    if (i.template && typeof i.template === 'string')
      templates.push(i.template)

    return {
      ...i,
      templates,
    }
  })
}

/**
 * Applies key and args substitution to a single refactor template string.
 * Supports both `$1` and `{key}` as key placeholders, and `{args}` for arguments.
 */
export function applyRefactorTemplate(template: string, keypath: string, argsString = ''): string {
  return template
    .replace(/\$1/g, keypath)
    .replace(/\{key\}/g, keypath)
    .replace(/\{args\}/g, argsString)
}
