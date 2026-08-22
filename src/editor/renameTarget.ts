import type { KeyInDocument } from '~/core/types'

export interface RenameTarget {
  key: string
  start: number
  end: number
}

/**
 * Resolve the complete i18n key represented by the current selection or cursor.
 * A partial selection inside a key still resolves to the whole key, matching
 * VS Code's rename-symbol behavior.
 */
export function findRenameTarget(
  keys: KeyInDocument[],
  cursorOffset: number,
  selectionStart = cursorOffset,
  selectionEnd = cursorOffset,
): RenameTarget | undefined {
  if (selectionStart > selectionEnd)
    [selectionStart, selectionEnd] = [selectionEnd, selectionStart]

  if (selectionStart !== selectionEnd) {
    const containingSelection = keys
      .filter(key => key.start <= selectionStart && key.end >= selectionEnd)
      .sort((a, b) => (a.end - a.start) - (b.end - b.start))[0]
    if (containingSelection)
      return containingSelection

    // Also accept a selection that includes only the surrounding quotes.
    const quotedSelection = keys.filter(key =>
      selectionStart >= key.start - 1
      && selectionEnd <= key.end + 1
      && selectionStart <= key.start
      && selectionEnd >= key.end,
    )
    if (quotedSelection.length === 1)
      return quotedSelection[0]

    return undefined
  }

  return keys.find(key => key.start <= cursorOffset && key.end >= cursorOffset)
}
