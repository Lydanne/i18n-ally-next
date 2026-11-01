import type { spawn as Spawn } from 'child_process'
import path from 'path'
// @ts-expect-error cross-spawn does not ship TypeScript declarations
import spawn from 'cross-spawn'
import { Config, Global } from '~/core'
import i18n from '~/i18n'
import { Log } from '~/utils'
import { Parser } from './base'

const LanguageIds = {
  js: 'javascript',
  ts: 'typescript',
} as const

const LanguageExts = {
  js: 'm?js',
  ts: 'ts',
} as const

export class EcmascriptParser extends Parser {
  readonly readonly = true

  constructor(public readonly id: 'js' | 'ts' = 'js') {
    super([LanguageIds[id]], LanguageExts[id])
  }

  async parse() {
    return {}
  }

  async dump() {
    return ''
  }

  async load(filepath: string) {
    const loader = path.resolve(Config.extensionPath!, 'assets/loader.js')
    const tsNode = Config.parsersTypescriptTsNodePath
    const dir = Global.rootpath
    const compilerOptions = {
      importHelpers: false,
      allowJs: true,
      module: 'commonjs',
      ...Config.parsersTypescriptCompilerOption,
    }
    const options = JSON.stringify(compilerOptions)

    return new Promise<any>((resolve, reject) => {
      const command = tsNode === 'ts-node' ? tsNode : 'node'
      const args = [...(tsNode === 'ts-node' ? [] : [tsNode]), '--dir', dir, '--transpile-only', '--compiler-options', options, loader, filepath]
      const child = (spawn as typeof Spawn)(command, args)
      let stdout = ''
      let stderr = ''
      child.stdout!.setEncoding('utf8').on('data', (chunk: string) => {
        stdout += chunk
        if (Buffer.byteLength(stdout) > 1024 * 1024) {
          child.kill()
          reject(new Error('Locale loader output exceeds 1 MiB'))
        }
      })
      child.stderr!.setEncoding('utf8').on('data', (chunk: string) => {
        stderr = (stderr + chunk).slice(-1024 * 1024)
      })
      child.on('error', reject)
      child.on('close', (code) => {
        if (code !== 0)
          return reject(new Error(`Locale loader exited with code ${code}: ${stderr}`))
        try {
          resolve(JSON.parse(stdout.trim()))
        }
        catch (e) {
          reject(e)
        }
      })
    })
  }

  async save() {
    Log.error(i18n.t('prompt.writing_js'))
  }
}
