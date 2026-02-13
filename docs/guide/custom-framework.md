# Custom Framework

If your i18n solution is not natively supported, you can define a custom framework via a YAML configuration file.

## When to Use

i18n Ally Next has built-in support for many popular frameworks (Vue I18n, react-i18next, next-intl, Angular, etc.). You **don't need** a custom framework if you're using one of them.

Use a custom framework when:

- **Custom i18n library** — Your project uses a homegrown or less common translation library with its own `t()` function
- **CLI / Node.js tools** — Your project is a CLI tool or backend service that uses a custom translation function, not a web framework
- **Non-standard function names** — Your translation function has a different name (e.g. `translate()`, `msg()`, `i18n()`) that built-in frameworks don't recognize
- **Multiple translation patterns** — Your project mixes several translation function styles that no single built-in framework covers
- **Namespace with custom delimiter** — Your i18n keys use a non-standard namespace delimiter (e.g. `t("ns:key")`) that built-in frameworks don't handle

::: tip
You can check the [Supported Frameworks](/guide/supported-frameworks) page to see if your framework is already supported before creating a custom one.
:::

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

### `languageIds`

- **Type**: `string | string[]`
- **Required**: Yes

VS Code language IDs that determine which file types will have annotations, completions, and inline translation display enabled.

**When to use:** You must set this option so the extension knows which files to scan. Only files matching these language IDs will show inline translations and code completions.

**Scenario 1** — A pure TypeScript backend project:

```yaml
languageIds: typescript
```

**Scenario 2** — A React project with both `.ts` and `.tsx` files:

```yaml
languageIds:
  - typescript
  - typescriptreact
```

**Scenario 3** — A full-stack project with multiple file types:

```yaml
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact
  - vue
```

Supported values: `javascript`, `typescript`, `javascriptreact`, `typescriptreact`, `vue`, `vue-html`, `json`, `html`, `dart`, `php`, `ejs`, `ruby`, `erb`, `html.erb`, `js.erb`, `haml`, `slim`, `handlebars`, `blade`, `svelte`, `xml`

### `usageMatchRegex`

- **Type**: `string | string[]`
- **Required**: Yes

Regex patterns to detect i18n keys in code. Use `{key}` as placeholder, which will be replaced by the actual key matching pattern (configurable via `i18n-ally-next.regex.key`).

The regex **must** contain a capture group `({key})` to extract the key value.

**When to use:** This is the core configuration that tells the extension how to find translation keys in your code. You need to write a regex that matches your project's translation function call pattern.

**Scenario 1** — Simple `t()` function, common in most i18n libraries:

```yaml
# Matches: t('hello'), t("hello"), t(`hello`)
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
```

```typescript
const msg = t('hello.world')  // ✅ detected
```

**Scenario 2** — Object method call like `i18n.t()`:

```yaml
# Matches: i18n.t('key'), this.i18n.t('key')
usageMatchRegex:
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
```

```typescript
const msg = i18n.t('hello.world')  // ✅ detected
```

**Scenario 3** — Multiple patterns in the same project:

```yaml
# Some files use t(), others use i18n.t() or $t()
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
```

**Scenario 4** — Decorator or comment-based annotation:

```yaml
# Matches: /* i18n */ 'key' (comment annotation pattern)
usageMatchRegex:
  - "/\\*\\s*i18n\\s*\\*/\\s*['\"`]({key})['\"`]"
```

```typescript
const label = /* i18n */ 'button.submit'  // ✅ detected
```

::: tip
`\\W` matches a non-word character, preventing false matches like `ият('...')`. If your function name starts at the beginning of a line, use `(?:^|\\W)` instead.
:::

::: warning
YAML requires escaping backslashes. A regex `\W` must be written as `\\W` in YAML.
:::

### `refactorTemplates`

- **Type**: `string[]`
- **Default**: `["$1"]`

Templates for the "Extract to i18n" refactoring. When you select a hard-coded string in your code and run the extract command, the extension will offer these templates as replacement options. Use `$1` as placeholder for the key.

**When to use:** Set this to match your project's translation function style, so extracted strings are replaced with the correct function call format.

**Scenario 1** — Standard TypeScript project using `t()`:

```yaml
refactorTemplates:
  - "t('$1')"
```

```typescript
// Before extract: const msg = "Hello World"
// After extract:  const msg = t('hello_world')
```

**Scenario 2** — React JSX project, need both plain and JSX expression formats:

```yaml
refactorTemplates:
  - "t('$1')"       # for use in JS logic
  - "{t('$1')}"     # for use in JSX templates
```

```tsx
// In JS:  const msg = t('hello')
// In JSX: <p>{t('hello')}</p>
```

**Scenario 3** — Vue project using `$t()`:

```yaml
refactorTemplates:
  - "$t('$1')"
```

### `namespace`

- **Type**: `boolean`
- **Default**: `false`

Enable namespace support. When enabled, the filename (without extension) of each locale file is treated as its namespace.

**When to use:** Enable this when your project organizes translations into multiple files per locale (e.g. `common.json`, `settings.json`, `auth.json`), and each file represents a logical module or feature.

**Scenario 1** — A large project with translations split by feature module:

```yaml
namespace: true
```

```text
locales/
├── en/
│   ├── common.json      ← namespace: "common"
│   ├── auth.json        ← namespace: "auth"
│   └── settings.json    ← namespace: "settings"
└── zh-CN/
    ├── common.json
    ├── auth.json
    └── settings.json
```

```typescript
t('common.ok')           // → common.json → { "ok": "OK" }
t('auth.login')          // → auth.json   → { "login": "Login" }
t('settings.theme.dark') // → settings.json → { "theme": { "dark": "Dark" } }
```

**Scenario 2** — A CLI tool with commands split into separate locale files:

```yaml
namespace: true
namespaceDelimiter: ":"
```

```typescript
t('review:description')  // → review.json → { "description": "..." }
t('deploy:options.env')  // → deploy.json → { "options": { "env": "..." } }
```

**Without namespace** — All translations in a single file per locale, no need to enable:

```text
locales/
├── en.json       ← all keys in one file
└── zh-CN.json
```

::: tip
When using namespaces, make sure to configure `pathMatcher` in your VS Code settings to match the directory structure:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json"
}
```

:::

### `namespaceDelimiter`

- **Type**: `string`
- **Default**: `"."`

The delimiter used **in code** to separate namespace from key. This tells the extension how to parse `t("namespace<delimiter>key")` into the namespace part and the key part.

**When to use:** Set this when your translation function uses a non-dot character to separate namespace and key. Common in i18next-style libraries that use `:`, or path-style libraries that use `/`.

**Scenario 1** — i18next-style with `:` delimiter:

```yaml
namespaceDelimiter: ":"
```

```typescript
t('common:ok')       // namespace = "common", key = "ok"
t('auth:login.btn')  // namespace = "auth",   key = "login.btn"
```

**Scenario 2** — Path-style with `/` delimiter:

```yaml
namespaceDelimiter: "/"
```

```typescript
t('common/ok')       // namespace = "common", key = "ok"
t('auth/login.btn')  // namespace = "auth",   key = "login.btn"
```

**Scenario 3** — Default `.` delimiter (no need to set):

```typescript
t('common.ok')       // namespace = "common", key = "ok"
// ⚠️ Ambiguous: is "common" a namespace or a nested key?
// Use a different delimiter to avoid this ambiguity.
```

| Delimiter | Code Example | Locale File |
| --- | --- | --- |
| `:` | `t("common:title")` | `common.json` → `{ "title": "..." }` |
| `.` | `t("common.title")` | `common.json` → `{ "title": "..." }` |
| `/` | `t("common/title")` | `common.json` → `{ "title": "..." }` |

::: warning
`namespaceDelimiter` only takes effect when `namespace` is set to `true`.
:::

### `scopeRangeRegex`

- **Type**: `string`
- **Default**: None

Regex to detect namespace scope ranges in code. The **first capture group** must be the namespace name. When a scope is detected, all `t()` calls within that scope are automatically prefixed with the namespace — you don't need to write the namespace in every key.

**When to use:** Use this when your project has a function or hook that sets the "current namespace" for a block of code, like React's `useTranslation()` or a custom `useMessages()` hook.

**Scenario 1** — React-style `useTranslation` hook:

```yaml
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
```

```tsx
const { t } = useTranslation("settings")

t("title")        // → automatically resolves to "settings.title"
t("theme.dark")   // → automatically resolves to "settings.theme.dark"

// Explicit namespace still works — overrides the scope
t("common:ok")    // → resolves to "common.ok" (not "settings.common.ok")
```

**Scenario 2** — Custom `useMessages` hook:

```yaml
scopeRangeRegex: "useMessages\\(['\"](.+?)['\"]\\)"
```

```tsx
const t = useMessages("dashboard")

t("title")        // → "dashboard.title"
t("stats.total")  // → "dashboard.stats.total"
```

**Scenario 3** — Multiple scopes in one file:

```tsx
// Scope 1: "header"
const headerT = useTranslation("header")
headerT("logo")    // → "header.logo"
headerT("nav")     // → "header.nav"

// Scope 2: "footer" — previous scope ends here
const footerT = useTranslation("footer")
footerT("links")   // → "footer.links"
```

**How scope ranges work:**

- Each regex match starts a new scope range
- The scope extends from the match position to the next scope match (or end of file)
- If the capture group is empty, the previous scope ends without starting a new one
- Keys with explicit namespace delimiter are not affected by scope

### `monopoly`

- **Type**: `boolean`
- **Default**: `false`

If `true`, disables all other built-in frameworks (Vue I18n, react-i18next, etc.), leaving only the custom framework active.

**When to use:** Enable this when your project uses a completely custom i18n solution and built-in framework detection causes false positives or conflicts.

**Scenario 1** — A CLI tool with its own i18n system, no web framework involved:

```yaml
monopoly: true
```

The extension won't try to detect Vue, React, Angular, etc. Only your custom regex patterns are used.

**Scenario 2** — A project that uses a web framework but with a custom i18n wrapper:

```yaml
# Don't set monopoly, let both frameworks coexist
monopoly: false
```

```jsonc
// .vscode/settings.json — enable both
{
  "i18n-ally-next.enabledFrameworks": ["vue", "custom"]
}
```

::: tip
If you're unsure, leave `monopoly` as `false`. Only set it to `true` if you see incorrect key detection from built-in frameworks.
:::

## Examples

### Simple `t()` Function

A minimal setup for a project using a simple `t()` translation function:

```yaml
languageIds:
  - typescript
  - javascript
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "t('$1')"
```

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en"
}
```

```text
src/locales/
├── en.json
└── zh-CN.json
```

### Namespace with `:` Delimiter

For projects that use `:` to separate namespace and key, like `t("review:description")`:

```yaml
languageIds:
  - typescript
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
refactorTemplates:
  - "t('$1')"
```

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json"
}
```

```text
src/locales/
├── en/
│   ├── common.json
│   └── review.json
└── zh-CN/
    ├── common.json
    └── review.json
```

```typescript
// t("review:description") → review.json → { "description": "..." }
// t("common:ok")          → common.json → { "ok": "..." }
```

### Scope-based Namespace

For projects where namespace is determined by a function call (like React hooks):

```yaml
languageIds:
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
scopeRangeRegex: "useMessages\\(['\"](.+?)['\"]\\)"
namespace: true
refactorTemplates:
  - "{t('$1')}"
```

```tsx
const t = useMessages("settings")

// Keys are automatically scoped to "settings" namespace
t("title")       // → resolves to "settings.title"
t("theme.dark")  // → resolves to "settings.theme.dark"
```

### Multiple Translation Functions

For projects with multiple translation patterns:

```yaml
languageIds:
  - typescript
  - typescriptreact
  - vue
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.global\\.t\\(\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "t('$1')"
  - "$t('$1')"
  - "i18n.t('$1')"
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

::: tip
Custom framework can coexist with built-in frameworks. For example, you can use both `vue` and `custom` frameworks:

```jsonc
{
  "i18n-ally-next.enabledFrameworks": ["vue", "custom"]
}
```

If you want the custom framework to be the only one, set `monopoly: true` in the YAML config.
:::

## Related Settings

These VS Code settings are commonly used together with custom frameworks:

| Setting | Description |
| --- | --- |
| `i18n-ally-next.localesPaths` | Paths to locale files |
| `i18n-ally-next.sourceLanguage` | Source language code (e.g. `en`) |
| `i18n-ally-next.pathMatcher` | Locale file path pattern (e.g. `{locale}/{namespace}.json`) |
| `i18n-ally-next.keystyle` | Key style: `nested`, `flat`, or `auto` |
| `i18n-ally-next.dirStructure` | Directory structure: `file` or `dir` |
| `i18n-ally-next.defaultNamespace` | Default namespace when no explicit namespace is specified |
| `i18n-ally-next.namespace` | Enable namespace globally (alternative to setting it in YAML) |

## Hot Reload

The custom framework config supports hot reload. Any changes to the YAML file will automatically trigger a reload of the extension — no need to restart VS Code or reload the window.
