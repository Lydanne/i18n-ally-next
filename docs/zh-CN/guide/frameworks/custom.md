# 自定义框架

当你的 i18n 方案不在内置支持列表中时，可以通过自定义框架获得完整的 i18n Ally Next 支持。

## 基本自定义配置

创建 `.vscode/i18n-ally-next-custom-framework.yml`：

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

## 匹配多种模式

如果项目中使用了多种翻译函数，添加所有匹配模式：

```yaml
usageMatchRegex:
  # t('key')
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  # i18n.t('key')
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  # $t('key') 模板中
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
  # <Trans i18nKey="key">
  - "i18nKey=['\"`]({key})['\"`]"
```

## 自定义分隔符的命名空间

```yaml
languageIds:
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
# 从 useTranslation('ns') 自动检测命名空间作用域
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
refactorTemplates:
  - "{t('$1')}"
```

这样可以实现：

```tsx
const { t } = useTranslation('settings')
t('title')       // → 解析为 settings:title
t('auth:login')  // → 显式命名空间
```

## 独占模式

如果自定义框架应该是唯一激活的框架，设置 `monopoly: true` 禁用所有内置框架：

```yaml
monopoly: true
languageIds:
  - typescript
usageMatchRegex:
  - "\\Wintl\\.formatMessage\\(\\{\\s*id:\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "intl.formatMessage({ id: '$1' })"
```

## 与内置框架组合使用

自定义框架可以与内置框架同时使用：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["react-i18next", "custom"]
}
```

适用于项目使用标准框架但同时有自定义翻译辅助函数的场景。
