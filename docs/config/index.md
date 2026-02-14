# Configuration Reference

i18n Ally Next supports two types of configuration files, each serving a different purpose:

## [.vscode/settings.json](/config/settings)

VS Code workspace settings file (`.vscode/settings.json`). All options are prefixed with `i18n-ally-next.`.

This is the **primary configuration** that controls the extension's behavior: language settings, annotation style, translation engines, file writing options, and more. Most users only need this file.

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.enabledFrameworks": ["vue"]
}
```

## [.vscode/i18n-ally-next-custom-framework.yml](/config/custom-framework)

Custom framework YAML configuration file (`.vscode/i18n-ally-next-custom-framework.yml`).

This file is **only needed** when your project uses an i18n framework that is not natively supported. It defines how the extension detects and handles translation keys for your custom framework: language IDs, usage match regex, refactor templates, namespace settings, etc.

```yaml
# .vscode/i18n-ally-next-custom-framework.yml
languageIds:
  - typescript
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "t('$1')"
```

::: tip
If you're using a [supported framework](/guide/supported-frameworks) (Vue I18n, react-i18next, next-intl, etc.), you don't need the custom framework config — just use `settings.json`.
:::
