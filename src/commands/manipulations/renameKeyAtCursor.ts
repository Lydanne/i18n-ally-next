import { commands, window } from 'vscode'
import { KeyDetector } from '~/core'
import { findRenameTarget } from '~/editor/renameTarget'
import { RenameKey } from './renameKey'

/**
 * Give i18n key usages priority for F2 while preserving the language server's
 * normal rename behavior everywhere else.
 */
export async function RenameKeyAtCursor() {
  const editor = window.activeTextEditor
  if (!editor)
    return

  const document = editor.document
  const selection = editor.selection
  const target = findRenameTarget(
    KeyDetector.getKeys(document),
    document.offsetAt(selection.active),
    document.offsetAt(selection.start),
    document.offsetAt(selection.end),
  )

  if (target)
    return await RenameKey(target.key, { preventOverride: true, showErrors: true })

  // Execute the built-in command directly, so Python symbols still go through
  // Pylance without re-entering this extension's F2 keybinding.
  return await commands.executeCommand('editor.action.rename')
}
