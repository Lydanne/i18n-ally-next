# Path Matcher

Path matcher defines how locale files are discovered and how locale/namespace information is extracted from file paths.

## Default Patterns

The default pattern depends on your directory structure:

| Dir Structure | Namespace | Pattern |
| --- | --- | --- |
| `file` | — | `{locale}.{ext}` |
| `dir` | disabled | `{locale}/**/*.{ext}` |
| `dir` | enabled | `{locale}/**/{namespace}.{ext}` |

## Placeholders

| Placeholder | Description |
| --- | --- |
| `{locale}` | Locale code (e.g. `en`, `zh-CN`) |
| `{namespace}` | Namespace name derived from filename |
| `{ext}` | File extension (auto-resolved from enabled parsers) |
| `*` / `**` | Glob wildcards |

## Custom Path Matcher

Override the default pattern:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

## Examples

### Flat Files

```text
locales/en.json
locales/zh-CN.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{locale}.{ext}" }
```

### Nested by Locale

```text
locales/en/common.json
locales/en/review.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{locale}/{namespace}.{ext}" }
```

### Nested by Namespace

```text
locales/common/en.json
locales/common/zh-CN.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{namespace}/{locale}.{ext}" }
```

### Deep Nesting

```text
src/modules/auth/i18n/en.json
src/modules/dashboard/i18n/en.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{namespace}/i18n/{locale}.{ext}" }
```
