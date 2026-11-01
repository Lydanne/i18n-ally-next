import type { Range, TextEditor, Disposable as VSCodeDisposable } from 'vscode'
import { Disposable, EventEmitter, OverviewRulerLane, ThemeColor, window, workspace } from 'vscode'

interface SearchDecorationState {
  ranges: readonly Range[]
  rangeKeys: ReadonlySet<string>
}

function getRangeKey(range: Range) {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`
}

const overviewRulerColor = new ThemeColor('editorOverviewRuler.findMatchForeground')

class SearchDecorationManager implements VSCodeDisposable {
  private readonly activeDecorationType = window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    border: '1px solid rgba(255, 215, 0, 0.8)',
    borderRadius: '2px',
    overviewRulerColor,
    overviewRulerLane: OverviewRulerLane.Center,
  })

  private readonly matchDecorationType = window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    overviewRulerColor,
    overviewRulerLane: OverviewRulerLane.Center,
  })

  private readonly _onDidChange = new EventEmitter<void>()
  private readonly editors = new Map<TextEditor, SearchDecorationState>()
  readonly onDidChange = this._onDidChange.event
  private readonly disposables = [
    window.onDidChangeActiveTextEditor((editor) => {
      if (!editor || !this.editors.has(editor))
        this.clear()
    }),
    window.onDidChangeTextEditorSelection(({ textEditor, selections }) => {
      const state = this.editors.get(textEditor)
      if (state && !selections.some(selection => state.ranges.some(range => selection.isEqual(range))))
        this.clear()
    }),
    workspace.onDidChangeTextDocument(({ document }) => {
      if (!this.editors.size)
        return
      for (const editor of this.editors.keys()) {
        if (editor.document === document) {
          this.clear()
          return
        }
      }
    }),
  ]

  replace(editor: TextEditor, ranges: Range[]) {
    const hadDecorations = this.reset()
    if (!ranges.length) {
      if (hadDecorations)
        this._onDidChange.fire()
      return
    }
    editor.setDecorations(this.activeDecorationType, ranges)
    this.track(editor, ranges)
    this._onDidChange.fire()
  }

  replaceMatches(editor: TextEditor, ranges: Range[], activeRange?: Range) {
    const hadDecorations = this.reset()
    if (!ranges.length) {
      if (hadDecorations)
        this._onDidChange.fire()
      return
    }

    const inactiveRanges = activeRange
      ? ranges.filter(range => !range.isEqual(activeRange))
      : ranges
    editor.setDecorations(this.matchDecorationType, inactiveRanges)
    editor.setDecorations(this.activeDecorationType, activeRange ? [activeRange] : [])
    this.track(editor, ranges)
    this._onDidChange.fire()
  }

  has(editor: TextEditor, range: Range) {
    return this.editors.get(editor)?.rangeKeys.has(getRangeKey(range)) ?? false
  }

  private track(editor: TextEditor, ranges: readonly Range[]) {
    this.editors.set(editor, {
      ranges,
      rangeKeys: new Set(ranges.map(getRangeKey)),
    })
  }

  private reset() {
    const hadDecorations = this.editors.size > 0
    for (const editor of this.editors.keys()) {
      try {
        editor.setDecorations(this.activeDecorationType, [])
        editor.setDecorations(this.matchDecorationType, [])
      }
      catch {}
    }
    this.editors.clear()
    return hadDecorations
  }

  clear() {
    if (this.reset())
      this._onDidChange.fire()
  }

  dispose() {
    this.reset()
    Disposable.from(...this.disposables).dispose()
    this.activeDecorationType.dispose()
    this.matchDecorationType.dispose()
    this._onDidChange.dispose()
  }
}

export const searchDecorations = new SearchDecorationManager()
