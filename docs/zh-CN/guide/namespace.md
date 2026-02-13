# 命名空间

命名空间允许你将翻译按功能或模块拆分到多个文件中。例如 `t("review:description")` 表示 `review` 命名空间下的 `description` 键。

## 工作原理

启用命名空间后：

1. **文件匹配** 使用 `{locale}/**/{namespace}.{ext}` 模式，`locales/en/review.json` 映射为命名空间 `review`
2. **键解析** 将 `review:description` 转换为在 `review.json` 中查找 `description`
3. **树构建** 在内部按命名空间前缀组织键

## 支持的框架

以下框架内置命名空间支持：

| 框架 | 分隔符 | 自动启用 |
| --- | --- | --- |
| **react-i18next** | `:` 或 `/` | ✅ |
| **i18next** | `:` 或 `/` | ✅ |
| **next-intl** | `.` | ✅ |
| **next-international** | `.` | ✅ |
| **next-translate** | — | ✅ |
| **laravel** | — | ✅ |
| **php-gettext** | — | ✅ |
| **custom** | 可配置 | 通过配置 |

## 文件结构

按命名空间组织语言文件：

```text
locales/
├── en/
│   ├── common.json      # 命名空间: common
│   ├── review.json      # 命名空间: review
│   └── settings.json    # 命名空间: settings
├── zh-CN/
│   ├── common.json
│   ├── review.json
│   └── settings.json
```

每个文件只包含该命名空间的键：

```json
// locales/en/review.json
{
  "description": "Description",
  "approve": "Approve",
  "reject": "Reject"
}
```

## 代码中的用法

### react-i18next / i18next

```tsx
// 使用 `:` 分隔符显式指定命名空间
t("review:description")    // → 在 review.json 中查找 "description"
t("common:greeting")       // → 在 common.json 中查找 "greeting"

// 使用 useTranslation hook（基于作用域）
const { t } = useTranslation("review")
t("description")           // → 自动限定在 review 命名空间

// 使用 ns 选项
t("description", { ns: "review" })
```

### next-intl

```tsx
// 通过 useTranslations 指定命名空间
const t = useTranslations("review")
t("description")
```

## 手动配置

对于没有内置命名空间支持的框架，手动启用：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.namespace": true
}
```

### 默认命名空间

如果大部分键属于同一个命名空间，可以设置默认值：

```jsonc
{
  "i18n-ally-next.defaultNamespace": "common"
}
```

没有显式命名空间前缀的键将在默认命名空间下解析。

### 自定义路径匹配

如果你的文件结构不符合默认模式，使用自定义路径匹配：

```jsonc
{
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

## 自定义框架

你可以在[自定义框架](/zh-CN/guide/custom-framework)配置中启用命名空间：

```yaml
# .vscode/i18n-ally-next-custom-framework.yml
languageIds:
  - typescript
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
```
