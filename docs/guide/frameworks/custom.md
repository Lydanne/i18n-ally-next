# Custom Framework

When your i18n solution is not natively supported, define a custom framework to get full i18n Ally Next support.

## Basic Custom Setup

Create `.vscode/i18n-ally-next-custom-framework.yml`:

```yaml
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact

usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"

refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"
```

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

## Matching Multiple Patterns

If your project uses multiple translation functions, add all patterns:

```yaml
usageMatchRegex:
  # t('key')
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  # i18n.t('key')
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  # $t('key') in templates
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
  # <Trans i18nKey="key">
  - "i18nKey=['\"`]({key})['\"`]"
```

## Namespace with Custom Delimiter

```yaml
languageIds:
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
# Auto-detect namespace scope from useTranslation('ns')
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
refactorTemplates:
  - "{t('$1')}"
```

This enables:

```tsx
const { t } = useTranslation('settings')
t('title')       // → resolves to settings:title
t('auth:login')  // → explicit namespace
```

## Monopoly Mode

If your custom framework should be the only active one, set `monopoly: true` to disable all built-in frameworks:

```yaml
monopoly: true
languageIds:
  - typescript
usageMatchRegex:
  - "\\Wintl\\.formatMessage\\(\\{\\s*id:\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "intl.formatMessage({ id: '$1' })"
```

## Combining with Built-in Frameworks

You can use a custom framework alongside built-in ones:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["react-i18next", "custom"]
}
```

This is useful when your project uses a standard framework but also has custom translation helpers.
