# Extract Hard Strings

i18n Ally Next can detect hard-coded strings in your source code and help you extract them into locale files.

## Auto Detection

Enable auto-detection to highlight hard-coded strings in real time:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.extract.autoDetect": true
}
```

Hard strings will appear in the sidebar under the **Hard-coded Strings** section.

## Extract a Single String

1. Place your cursor on a hard-coded string
2. Click the lightbulb icon or use `Cmd+.` (macOS) / `Ctrl+.` (Windows/Linux)
3. Select **Extract to i18n**
4. Enter the key name
5. Choose the target locale file

## Batch Extraction

Right-click a file in the Explorer and select **Extract all hard-coded strings (experimental)** to extract all detected strings at once.

## Key Generation Strategy

Control how keys are auto-generated:

```jsonc
{
  // "slug" (default) — generates slug-like keys: "hello-world"
  // "random" — generates random keys
  "i18n-ally-next.extract.keygenStrategy": "slug",

  // Key name style: "default", "camelCase", "PascalCase", "snake_case", "kebab-case"
  "i18n-ally-next.extract.keygenStyle": "default",

  // Maximum key length
  "i18n-ally-next.extract.keyMaxLength": 50,

  // Prefix for generated keys
  "i18n-ally-next.extract.keyPrefix": ""
}
```

## Target File Picking Strategy

When multiple locale files exist, control how the target file is selected:

```jsonc
{
  // "none" — always prompt
  // "auto" — automatically resolve from source language file structure (supports namespace)
  // "most-similar" — pick the file most similar to the current file path
  // "most-similar-by-key" — pick by key prefix match
  // "file-previous" — remember per-file selection
  // "global-previous" — remember globally
  "i18n-ally-next.extract.targetPickingStrategy": "none"
}
```

## Ignored Strings

Exclude specific strings from detection:

```jsonc
{
  "i18n-ally-next.extract.ignored": [
    "TODO",
    "FIXME"
  ],
  "i18n-ally-next.extract.ignoredByFiles": {
    "src/constants.ts": ["SOME_CONSTANT"]
  }
}
```

## Refactor Templates

Customize the code that replaces the extracted string:

```jsonc
{
  "i18n-ally-next.refactor.templates": [
    {
      "source": "js-string",
      "templates": ["t('{key}')"]
    },
    {
      "source": "jsx-text",
      "templates": ["{t('{key}')}"]
    }
  ]
}
```

Available sources: `html-attribute`, `html-inline`, `js-string`, `js-template`, `jsx-text`.

## Project-wide Scan & Extract

Beyond single-file and batch extraction, i18n Ally Next supports **scanning the entire project** for hard-coded strings and extracting them all at once.

### Running the Scan

Run `i18n Ally Next: Scan and Extract All` from the Command Palette.

The process:

1. Scans all supported files in the project (respects `.gitignore`)
2. Detects hard-coded strings in each file
3. Shows a summary: **N files** with **M hard-coded strings** found
4. After confirmation, automatically extracts all strings — generating key names and writing to locale files

### Scan Configuration

Control which files are included or excluded from scanning:

```jsonc
{
  // Glob patterns for files to include in scanning
  // If empty, uses the default supported language glob
  "i18n-ally-next.extract.scanningInclude": [
    "src/**/*.{ts,tsx,vue,js,jsx}"
  ],

  // Glob patterns for files to ignore during scanning
  "i18n-ally-next.extract.scanningIgnore": [
    "src/generated/**",
    "src/**/*.test.*",
    "src/**/*.spec.*"
  ]
}
```

::: tip
For large projects, narrow the scan scope with `scanningInclude` to avoid scanning irrelevant files and speed up the process.
:::
