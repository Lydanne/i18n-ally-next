import { join, resolve } from 'path'
import fs from 'fs-extra'
// @ts-expect-error
import { glob } from 'glob-gitignore'
// @ts-expect-error
import parseGitIgnore from 'parse-gitignore'
import { Config } from '../core/Config'
import { Global } from '../core/Global'
import { Log } from './Log'

export async function gitignoredGlob(globStr: string, dir: string, extraIgnore: string[] = []) {
  const root = Global.rootpath
  const gitignorePath = join(root, '.gitignore')
  let gitignore = []
  try {
    if (fs.existsSync(gitignorePath))
      gitignore = parseGitIgnore(await fs.promises.readFile(gitignorePath)).patterns
  }
  catch (e) {
    Log.error(e)
  }

  const ignore = [
    'node_modules',
    'dist',
    'build',
    'out',
    '.output',
    '.nuxt',
    '.next',
    'coverage',
    '__snapshots__',
    '__tests__',
    '__mocks__',
    '*.test.*',
    '*.spec.*',
    '*.min.*',
    '*.d.ts',
    ...gitignore,
    ...Global.localesPaths || [],
    ...Config.usageScanningIgnore,
    ...extraIgnore,
  ]

  const files = await glob(globStr, {
    cwd: dir,
    ignore,
  }) as string[]

  return files.map(f => resolve(dir, f))
}
