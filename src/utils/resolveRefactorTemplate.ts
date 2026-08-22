import type { CustomRefactorTemplate, NamedInterpolationArgument } from '~/core/types'

export function applyRefactorTemplate(
  template: string,
  keypath: string,
  args: string[] = [],
  namedArgs: NamedInterpolationArgument[] = [],
): string {
  const argsString = args.length ? `,${args.join(',')}` : ''
  const namedArgsString = namedArgs.length
    ? `, ${namedArgs.map(argument => `${argument.name}=${argument.expression}`).join(', ')}`
    : ''
  return template
    .replace(/\{key\}/g, () => keypath)
    .replace(/\{args\}/g, () => argsString)
    .replace(/\{namedArgs\}/g, () => namedArgsString)
}

export function resolveRefactorTemplate(arr: (string | CustomRefactorTemplate & { template?: string })[] = []): CustomRefactorTemplate[] {
  return arr.map((i) => {
    if (typeof i === 'string') {
      return {
        templates: [i],
      }
    }
    const templates = i.templates || []
    if (i.template && typeof i.template === 'string')
      templates.push(i.template)

    return {
      ...i,
      templates,
    }
  })
}
