import type { ExtensionContext } from 'vscode'
import { flatten } from 'lodash'
import commandsModules, { Commands } from '~/commands'
import { Config, CurrentFile, Global, KeyDetector } from '~/core'
import editorModules from '~/editor'
import i18n from '~/i18n'
import { Log } from '~/utils'
import viewsModules from '~/views'
import { version } from '../package.json'

export async function activate(ctx: ExtensionContext) {
  Log.info(`🈶 Activated, v${version}`)

  Config.ctx = ctx

  i18n.init(ctx.extensionPath)
  KeyDetector.init(ctx)

  // activate the extension
  await Global.init(ctx)
  CurrentFile.watch(ctx)

  const modules = [
    commandsModules,
    editorModules,
    viewsModules,
  ]

  const disposables = flatten(modules.map(m => m(ctx)))
  disposables.forEach(d => ctx.subscriptions.push(d))
}

export function deactivate() {
  Log.info('🈚 Deactivated')
}

export {
  Commands,
  Config,
  CurrentFile,
  Global,
  KeyDetector,
  Log,
}
