import type { Range, TextDocument } from 'vscode'
import type { ExtensionModule } from '~/modules'
import { commands, Selection, TextEditorRevealType, window } from 'vscode'
import { Commands } from '~/extension'

export async function GoToRange(document: TextDocument, range: Range) {
  if (document && range) {
    const editor = await window.showTextDocument(document)
    editor.selection = new Selection(
      range.end,
      range.start,
    )
    editor.revealRange(editor.selection, TextEditorRevealType.InCenter)
  }
}

export default <ExtensionModule> function () {
  return [
    commands.registerCommand(Commands.go_to_range, GoToRange),
  ]
}
