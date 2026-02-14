# .vscode/i18n-ally-next-custom-framework.yml

Custom framework configuration is defined in `.vscode/i18n-ally-next-custom-framework.yml` at your project root. This file tells the extension how to detect and handle i18n keys for frameworks that are not natively supported.

::: tip
For a step-by-step guide with examples, see [Custom Framework Guide](/guide/custom-framework).
:::

```yaml
# .vscode/i18n-ally-next-custom-framework.yml
languageIds:
  - typescript
  - typescriptreact

usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"

refactorTemplates:
  - "t('$1')"

namespace: true
namespaceDelimiter: ":"
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
monopoly: false
```

## `languageIds`

- **Type**: `string | string[]`
- **Required**: Yes

VS Code language IDs that determine which file types will have annotations, completions, and inline translation display enabled.

```yaml
# Single language
languageIds: typescript

# Multiple languages
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact
  - vue
```

Supported values: `javascript`, `typescript`, `javascriptreact`, `typescriptreact`, `vue`, `vue-html`, `json`, `html`, `dart`, `php`, `ejs`, `ruby`, `erb`, `html.erb`, `js.erb`, `haml`, `slim`, `handlebars`, `blade`, `svelte`, `xml`

## `usageMatchRegex`

- **Type**: `string | string[]`
- **Required**: Yes

Regex patterns to detect i18n keys in code. Use `{key}` as placeholder, which will be replaced by the actual key matching pattern (configurable via `i18n-ally-next.regex.key` in settings.json).

The regex **must** contain a capture group `({key})` to extract the key value.

```yaml
# Simple t() function
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"

# Multiple patterns
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
```

::: warning
YAML requires escaping backslashes. A regex `\W` must be written as `\\W` in YAML.
:::

## `refactorTemplates`

- **Type**: `string[]`
- **Default**: `["$1"]`

Templates for the "Extract to i18n" refactoring. When you select a hard-coded string and run the extract command, the extension will offer these templates as replacement options. Use `$1` as placeholder for the key.

```yaml
# Standard
refactorTemplates:
  - "t('$1')"

# React JSX — both plain and JSX expression formats
refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"

# Vue template
refactorTemplates:
  - "$t('$1')"
```

## `namespace`

- **Type**: `boolean`
- **Default**: `false`

Enable namespace support. When enabled, the filename (without extension) of each locale file is treated as its namespace.

```yaml
namespace: true
```

```text
locales/
├── en/
│   ├── common.json      ← namespace: "common"
│   ├── auth.json        ← namespace: "auth"
│   └── settings.json    ← namespace: "settings"
```

::: tip
When using namespaces, configure `pathMatcher` in your `settings.json`:

```jsonc
{ "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json" }
```

:::

## `namespaceDelimiter`

- **Type**: `string`
- **Default**: `"."`

The delimiter used in code to separate namespace from key. This tells the extension how to parse `t("namespace<delimiter>key")`.

```yaml
# i18next-style
namespaceDelimiter: ":"
# t('common:ok') → namespace = "common", key = "ok"

# Path-style
namespaceDelimiter: "/"
# t('common/ok') → namespace = "common", key = "ok"
```

| Delimiter | Code Example | Locale File |
| --- | --- | --- |
| `:` | `t("common:title")` | `common.json` → `{ "title": "..." }` |
| `.` | `t("common.title")` | `common.json` → `{ "title": "..." }` |
| `/` | `t("common/title")` | `common.json` → `{ "title": "..." }` |

::: warning
`namespaceDelimiter` only takes effect when `namespace` is set to `true`.
:::

## `scopeRangeRegex`

- **Type**: `string`
- **Default**: None

Regex to detect namespace scope ranges in code. The **first capture group** must be the namespace name. When a scope is detected, all `t()` calls within that scope are automatically prefixed with the namespace.

```yaml
# React-style useTranslation hook
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
```

```tsx
const { t } = useTranslation("settings")

t("title")        // → automatically resolves to "settings.title"
t("theme.dark")   // → automatically resolves to "settings.theme.dark"
```

**How scope ranges work:**

- Each regex match starts a new scope range
- The scope extends from the match position to the next scope match (or end of file)
- If the capture group is empty, the previous scope ends without starting a new one
- Keys with explicit namespace delimiter are not affected by scope

## `monopoly`

- **Type**: `boolean`
- **Default**: `false`

If `true`, disables all other built-in frameworks (Vue I18n, react-i18next, etc.), leaving only the custom framework active.

```yaml
# Only use custom framework, disable all built-in frameworks
monopoly: true
```

::: tip
If you're unsure, leave `monopoly` as `false`. Only set it to `true` if you see incorrect key detection from built-in frameworks.
:::

## Hot Reload

The custom framework config supports hot reload. Any changes to the YAML file will automatically trigger a reload — no need to restart VS Code or reload the window.

## Related Settings

These VS Code settings in `settings.json` are commonly used together with custom frameworks:

| Setting | Description |
| --- | --- |
| [`localesPaths`](/config/settings#localespaths) | Paths to locale files |
| [`sourceLanguage`](/config/settings#sourcelanguage) | Source language code (e.g. `en`) |
| [`pathMatcher`](/config/settings#pathmatcher) | Locale file path pattern (e.g. `{locale}/{namespace}.json`) |
| [`keystyle`](/config/settings#keystyle) | Key style: `nested`, `flat`, or `auto` |
| [`dirStructure`](/config/settings#dirstructure) | Directory structure: `file` or `dir` |
| [`defaultNamespace`](/config/settings#defaultnamespace) | Default namespace when no explicit namespace is specified |
| [`enabledFrameworks`](/config/settings#enabledframeworks) | Must include `"custom"` to enable |
