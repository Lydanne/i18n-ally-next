# Visual Translation Editor

i18n Ally Next includes a built-in Webview translation editor that provides a more intuitive editing experience than working directly with JSON/YAML locale files.

## Opening the Editor

There are several ways to open the editor:

- **Command Palette** — Run `i18n Ally Next: Open Editor` (`Cmd+Shift+P`)
- **Hover Menu** — Hover over a translation key in code and click the editor icon
- **Tree View** — Click a key in the i18n Ally sidebar

## Editor Modes

### Current File Mode

When opened from a code file, the editor enters **current file mode**:

- Only shows keys used in the currently active file
- Opens in a side column (ViewColumn.Two) for split-screen editing
- Automatically updates when you switch files or save changes
- Supports key navigation — jump between keys in the code and the editor stays in sync

### Standalone Mode

When opened from the command palette without a supported file active, the editor enters **standalone mode**:

- Browse and edit all translation keys in the project
- Search and filter keys
- Opens in the active column

## Features

- **Multi-language view** — See translations for all languages side by side
- **Inline editing** — Edit translations directly in the editor
- **Review integration** — View comments, approve/reject translations, and manage candidates
- **Real-time sync** — Changes to locale files are reflected immediately
- **Configuration sync** — Editor updates when VS Code settings change

## Configuration

```jsonc
// .vscode/settings.json
{
  // When hovering over a key, prefer opening the editor instead of inline editing
  "i18n-ally-next.editor.preferEditor": true
}
```

## Key Navigation

While the editor is open in current file mode, you can navigate between translation keys:

- **Next Key** — `Ctrl+Alt+→` (or `Cmd+Alt+→` on macOS)
- **Previous Key** — `Ctrl+Alt+←` (or `Cmd+Alt+←` on macOS)

The editor panel automatically syncs to show the key at your cursor position.

::: tip
Key navigation also works without the editor open — it will simply move your cursor to the next/previous translation key usage in the current file.
:::
