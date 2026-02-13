import type { ExtensionModule } from '~/modules'
import { commands } from 'vscode'
import { Analyst } from '~/core'
import { Commands } from './commands'

export default <ExtensionModule> function () {
  return [
    commands.registerCommand(Commands.refresh_usage, async () => {
      await Analyst.analyzeUsage(false)
    }),
  ]
}
