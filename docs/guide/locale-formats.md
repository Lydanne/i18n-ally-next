# Locale Formats

i18n Ally Next supports multiple locale file formats through its parser system.

## Supported Formats

| Format | Extensions | Parser ID |
| --- | --- | --- |
| **JSON** | `.json` | `json` |
| **JSON5** | `.json5` | `json5` |
| **YAML** | `.yml`, `.yaml` | `yaml` |
| **JavaScript** | `.js`, `.cjs`, `.mjs` | `js` |
| **TypeScript** | `.ts`, `.cts`, `.mts` | `ts` |
| **INI / Properties** | `.ini`, `.properties` | `ini` / `properties` |
| **PO (Gettext)** | `.po` | `po` |
| **PHP** | `.php` | `php` |
| **Fluent** | `.ftl` | `ftl` |

## Enable Specific Parsers

By default, the extension enables parsers based on the detected framework. You can override this:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledParsers": ["json", "yaml"]
}
```

## Extend File Extensions

Map custom file extensions to existing parsers:

```jsonc
{
  "i18n-ally-next.parsers.extendFileExtensions": {
    "lang": "json"
  }
}
```

This maps `.lang` files to the JSON parser.

## Parser Options

```jsonc
{
  // Indentation size for writing locale files
  "i18n-ally-next.indent": 2,

  // Tab style: "space" or "tab"
  "i18n-ally-next.tabStyle": "space",

  // File encoding
  "i18n-ally-next.encoding": "utf-8",

  // Sort keys when writing
  "i18n-ally-next.sortKeys": true,

  // Sort comparison method: "binary" or "locale"
  "i18n-ally-next.sortCompare": "binary"
}
```
