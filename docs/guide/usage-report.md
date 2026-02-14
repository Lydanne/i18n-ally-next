# Usage Report & Key Management

i18n Ally Next analyzes how translation keys are used across your codebase, helping you identify unused keys, missing translations, and maintain a clean locale file structure.

## Usage Report

The extension scans your source code to classify all translation keys into three categories:

### Active Keys

Keys that are **both defined in locale files and referenced in code**. These are your healthy, in-use translations.

### Idle Keys

Keys that are **defined in locale files but not referenced anywhere in code**. These may be:

- Deprecated translations that should be removed
- Keys used in dynamic patterns not detected by static analysis
- Keys referenced through derived key rules (e.g., pluralization suffixes)

### Missing Keys

Keys that are **referenced in code but not defined in locale files**. These need to be added to your translations.

## Viewing the Report

The usage report is displayed in the **i18n Ally sidebar** under the tree view. Each category shows the count and allows you to browse individual keys.

To refresh the report manually:

- **Command Palette** — Run `i18n Ally Next: Refresh Usage Report`
- **Sidebar** — Click the refresh icon in the tree view header

## Key Management Operations

### Duplicate Key

Copy a translation key and all its language values to a new key path:

1. Right-click a key in the sidebar tree view
2. Select **Duplicate Key**
3. Enter the new key path
4. All locale values are copied to the new path

### Fulfill Missing Keys

Create empty entries for all missing keys across all languages, making it easy to fill in translations later:

1. Run from the sidebar progress view — click **Fulfill** on a specific locale
2. Or run from the command palette to fulfill all missing keys for all locales

```jsonc
{
  // Keep fulfilled (empty) keys in locale files
  "i18n-ally-next.keepFulfilled": true
}
```

### Mark Key as In Use

Prevent a key from being reported as idle by manually marking it as "in use":

1. Right-click a key in the sidebar
2. Select **Mark as In Use**

The key is added to the `keysInUse` configuration. This setting also supports **glob patterns** for matching multiple keys:

```jsonc
{
  "i18n-ally-next.keysInUse": [
    "common.ok",
    "errors.*",
    "validation.**"
  ]
}
```

### Derived Key Rules

Some frameworks generate keys dynamically (e.g., pluralization: `item`, `item_one`, `item_other`). Configure derived key rules so the extension understands these relationships:

```jsonc
{
  "i18n-ally-next.usage.derivedKeyRules": [
    "{key}_one",
    "{key}_other",
    "{key}_zero",
    "{key}_two",
    "{key}_few",
    "{key}_many"
  ]
}
```

When a source key is active, its derived keys won't be reported as idle.

## Scanning Configuration

Control which files are scanned for usage analysis:

```jsonc
{
  // Glob patterns to ignore during usage scanning
  "i18n-ally-next.usage.scanningIgnore": [
    "dist/**",
    "node_modules/**",
    "*.test.ts"
  ]
}
```
