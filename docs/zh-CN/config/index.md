# 配置项参考

i18n Ally Next 支持两种配置文件，各有不同用途：

## [.vscode/settings.json](/zh-CN/config/settings)

VS Code 工作区设置文件（`.vscode/settings.json`）。所有选项以 `i18n-ally-next.` 为前缀。

这是**主要配置**，控制插件的行为：语言设置、注解样式、翻译引擎、文件写入选项等。大多数用户只需要这个文件。

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.enabledFrameworks": ["vue"]
}
```

## [.vscode/i18n-ally-next-custom-framework.yml](/zh-CN/config/custom-framework)

自定义框架 YAML 配置文件（`.vscode/i18n-ally-next-custom-framework.yml`）。

**仅在**项目使用非原生支持的 i18n 框架时需要此文件。它定义了插件如何检测和处理自定义框架的翻译键：语言 ID、使用匹配正则、重构模板、命名空间设置等。

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
如果你使用的是[已支持的框架](/zh-CN/guide/supported-frameworks)（Vue I18n、react-i18next、next-intl 等），不需要自定义框架配置——只需使用 `settings.json`。
:::
