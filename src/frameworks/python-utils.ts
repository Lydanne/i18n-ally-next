import type { NamedInterpolationArgument } from '~/core/types'
import type { PythonFStringArgumentStyle } from '~/extraction/parsers/options'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

const PROJECT_FILES = [
  'pyproject.toml',
  'requirements.txt',
  'setup.py',
  'setup.cfg',
  'Pipfile',
]

export function isPythonProject(root: string): boolean {
  if (PROJECT_FILES.some(file => existsSync(join(root, file))))
    return true
  try {
    return readdirSync(root, { withFileTypes: true })
      .some(entry => entry.isFile() && entry.name.endsWith('.py'))
  }
  catch {
    return false
  }
}

export function buildPythonRefactorTemplate(
  keypath: string,
  namedArgs: NamedInterpolationArgument[],
  style: PythonFStringArgumentStyle,
): string {
  const quotedKey = JSON.stringify(keypath)
  if (!namedArgs.length)
    return `_(${quotedKey})`

  const argumentsText = namedArgs.map(argument => `${argument.name}=${argument.expression}`).join(', ')
  if (style === 'format')
    return `_(${quotedKey}).format(${argumentsText})`
  return `_(${quotedKey}, ${argumentsText})`
}
