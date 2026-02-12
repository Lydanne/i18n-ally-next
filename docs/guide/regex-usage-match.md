# Regex Usage Match

Customize how i18n Ally Next detects i18n keys in your source code using regex patterns.

## How It Works

The extension uses regex patterns to find i18n function calls like `t("key")` in your code. Each framework provides default patterns, but you can override or extend them.

## Override All Patterns

Replace all framework-provided patterns:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.regex.usageMatch": [
    "\\Wt\\(\\s*['\"`]({key})['\"`]",
    "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

## Append Patterns

Add extra patterns without replacing the defaults:

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\WformatMessage\\(\\s*\\{\\s*id:\\s*['\"`]({key})['\"`]"
  ]
}
```

## Pattern Syntax

- Use `{key}` as the placeholder — it will be replaced with the key matching regex
- The first capture group `($1)` must be the key
- Patterns are applied with the `gm` flags (global, multiline)
- Use `\\W` (non-word character) to avoid matching inside variable names

## Custom Key Regex

By default, keys match `[\\w.-]+` (word characters, dots, hyphens). Override it:

```jsonc
{
  "i18n-ally-next.regex.key": "[\\w.:-]+"
}
```

This is useful when your keys contain special characters like `:` for namespaces.

## Examples

### Vue I18n `$t()`

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\$t\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

### React `<FormattedMessage id="..." />`

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\Wid=['\"`]({key})['\"`]"
  ]
}
```

### Custom Function `translate()`

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\Wtranslate\\(\\s*['\"`]({key})['\"`]"
  ]
}
```
