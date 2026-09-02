import type { Location } from 'vscode'
import type { KeyOccurrence } from '~/core'
import type { ExtensionModule } from '~/modules'
import { commands, Position, Range, Selection, TextEditorRevealType, Uri, window, workspace } from 'vscode'
import { Commands } from '~/commands'
import { Analyst, KeyDetector } from '~/core'
import i18n from '~/i18n'

interface ShowKeyReferencesArgs {
  uri?: Uri
  position?: Position
  keypath?: string
}

export async function ShowKeyReferences(args: ShowKeyReferencesArgs = {}) {
  let { uri, position, keypath } = args

  const editor = window.activeTextEditor
  if (!uri && editor)
    uri = editor.document.uri
  if (!position && editor)
    position = editor.selection.active

  if (!keypath && editor)
    keypath = KeyDetector.getKey(editor.document, position || new Position(0, 0))

  if (!keypath) {
    window.showWarningMessage(i18n.t('prompt.key_not_found'))
    return
  }

  const occurrences: readonly KeyOccurrence[] = await Analyst.getAllOccurrences(keypath)

  if (occurrences.length === 0) {
    window.showInformationMessage(i18n.t('prompt.key_has_no_occurrences', keypath))
    return
  }

  const locations: Location[] = await Promise.all(
    occurrences.map(o => Analyst.getLocationOf(o)),
  )

  if (!uri)
    uri = locations[0].uri
  if (!position)
    position = locations[0].range.start

  await commands.executeCommand(
    'editor.action.showReferences',
    uri,
    position,
    locations,
  )
}

export async function GoToLocation(args: { filepath: string, start?: number, end?: number, line?: number, character?: number }) {
  if (!args || !args.filepath)
    return

  const uri = Uri.file(args.filepath)
  const doc = await workspace.openTextDocument(uri)
  const editor = await window.showTextDocument(doc)

  let range: Range
  if (typeof args.start === 'number' && typeof args.end === 'number') {
    range = new Range(doc.positionAt(args.start), doc.positionAt(args.end))
  }
  else if (typeof args.line === 'number') {
    const char = args.character ?? 0
    range = new Range(new Position(args.line, char), new Position(args.line, char))
  }
  else {
    range = new Range(new Position(0, 0), new Position(0, 0))
  }

  editor.selection = new Selection(range.end, range.start)
  editor.revealRange(range, TextEditorRevealType.InCenter)
}

export default <ExtensionModule> function () {
  return [
    commands.registerCommand(Commands.show_key_references, ShowKeyReferences),
    commands.registerCommand(Commands.go_to_location, GoToLocation),
  ]
}
