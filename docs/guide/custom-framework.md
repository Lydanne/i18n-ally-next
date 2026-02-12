# Custom Framework

If your i18n solution is not natively supported, you can define a custom framework via a YAML configuration file.

## Configuration File

Create `.vscode/i18n-ally-next-custom-framework.yml` in your project root:

```yaml
# Language IDs to enable annotations
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact

# Regex patterns to detect i18n keys in code
# Use {key} as placeholder for the key pattern
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"

# Refactor templates for extracting strings
# Use $1 as placeholder for the key
refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"

# Enable namespace support
namespace: true

# Namespace delimiter (default: ".")
namespaceDelimiter: ":"

# Regex to detect scope ranges (namespace scoping)
# The first capture group is the namespace name
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"

# If true, disables all other frameworks
monopoly: false
```

## Options Reference

| Option | Type | Description |
| --- | --- | --- |
| `languageIds` | `string \| string[]` | VS Code language IDs to enable annotations |
| `usageMatchRegex` | `string \| string[]` | Regex patterns to detect i18n keys. Use `{key}` placeholder |
| `refactorTemplates` | `string[]` | Templates for string extraction. Use `$1` for key |
| `namespace` | `boolean` | Enable namespace support |
| `namespaceDelimiter` | `string` | Delimiter between namespace and key (e.g. `:`, `.`) |
| `scopeRangeRegex` | `string` | Regex to detect namespace scope ranges |
| `monopoly` | `boolean` | If `true`, disables all other frameworks |

## Examples

### Simple `t()` Function

```yaml
languageIds:
  - typescript
  - javascript
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "t('$1')"
```

### Namespace with `:` Delimiter

```yaml
languageIds:
  - typescript
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
```

This enables `t("review:description")` to resolve as namespace `review`, key `description`.

### Custom Scope Detection

```yaml
languageIds:
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
scopeRangeRegex: "useMessages\\(['\"](.+?)['\"]\\)"
refactorTemplates:
  - "{t('$1')}"
```

With this config, the following code will automatically scope keys:

```tsx
const t = useMessages("settings")
// t("title") → resolves to "settings.title"
```

## Enabling Custom Framework

You can either:

1. **Auto-detect** — Just create the YAML file, the extension will detect it automatically
2. **Manual** — Add `"custom"` to enabled frameworks:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["custom"]
}
```

## Hot Reload

The custom framework config supports hot reload. Any changes to the YAML file will automatically trigger a reload of the extension.
