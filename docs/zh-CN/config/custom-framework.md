# .vscode/i18n-ally-next-custom-framework.yml

自定义框架配置文件位于项目根目录的 `.vscode/i18n-ally-next-custom-framework.yml`。该文件告诉插件如何检测和处理非原生支持的 i18n 框架的翻译键。

::: tip
如需分步指南和示例，请参阅[自定义框架指南](/zh-CN/guide/custom-framework)。
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

- **类型**：`string | string[]`
- **必填**：是

VS Code 语言 ID，决定哪些文件类型启用注解、补全和内联翻译显示。

```yaml
# 单个语言
languageIds: typescript

# 多个语言
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact
  - vue
```

可用值：`javascript`、`typescript`、`javascriptreact`、`typescriptreact`、`vue`、`vue-html`、`json`、`html`、`dart`、`php`、`ejs`、`ruby`、`erb`、`html.erb`、`js.erb`、`haml`、`slim`、`handlebars`、`blade`、`svelte`、`xml`

## `usageMatchRegex`

- **类型**：`string | string[]`
- **必填**：是

检测代码中 i18n 键的正则表达式。使用 `{key}` 作为占位符，它会被替换为实际的键匹配模式（可通过 settings.json 中的 `i18n-ally-next.regex.key` 配置）。

正则表达式**必须**包含捕获组 `({key})` 来提取键值。

```yaml
# 简单的 t() 函数
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"

# 多种模式
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
```

::: warning
YAML 中需要转义反斜杠。正则表达式 `\W` 在 YAML 中必须写为 `\\W`。
:::

## `refactorTemplates`

- **类型**：`string[]`
- **默认值**：`["$1"]`

"提取为 i18n"重构的模板。当你选中硬编码字符串并执行提取命令时，插件会提供这些模板作为替换选项。使用 `$1` 作为键的占位符。

```yaml
# 标准
refactorTemplates:
  - "t('$1')"

# React JSX — 同时提供普通和 JSX 表达式格式
refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"

# Vue 模板
refactorTemplates:
  - "$t('$1')"
```

## `namespace`

- **类型**：`boolean`
- **默认值**：`false`

启用命名空间支持。启用后，每个 locale 文件的文件名（不含扩展名）被视为其命名空间。

```yaml
namespace: true
```

```text
locales/
├── en/
│   ├── common.json      ← 命名空间："common"
│   ├── auth.json        ← 命名空间："auth"
│   └── settings.json    ← 命名空间："settings"
```

::: tip
使用命名空间时，需要在 `settings.json` 中配置 `pathMatcher`：

```jsonc
{ "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json" }
```

:::

## `namespaceDelimiter`

- **类型**：`string`
- **默认值**：`"."`

代码中分隔命名空间和键的分隔符。告诉插件如何解析 `t("namespace<分隔符>key")`。

```yaml
# i18next 风格
namespaceDelimiter: ":"
# t('common:ok') → 命名空间 = "common"，键 = "ok"

# 路径风格
namespaceDelimiter: "/"
# t('common/ok') → 命名空间 = "common"，键 = "ok"
```

| 分隔符 | 代码示例 | Locale 文件 |
| --- | --- | --- |
| `:` | `t("common:title")` | `common.json` → `{ "title": "..." }` |
| `.` | `t("common.title")` | `common.json` → `{ "title": "..." }` |
| `/` | `t("common/title")` | `common.json` → `{ "title": "..." }` |

::: warning
`namespaceDelimiter` 仅在 `namespace` 设为 `true` 时生效。
:::

## `scopeRangeRegex`

- **类型**：`string`
- **默认值**：无

检测代码中命名空间作用域范围的正则表达式。**第一个捕获组**必须是命名空间名称。当检测到作用域时，该作用域内的所有 `t()` 调用会自动添加命名空间前缀。

```yaml
# React 风格的 useTranslation hook
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
```

```tsx
const { t } = useTranslation("settings")

t("title")        // → 自动解析为 "settings.title"
t("theme.dark")   // → 自动解析为 "settings.theme.dark"
```

**作用域范围的工作原理：**

- 每个正则匹配开始一个新的作用域范围
- 作用域从匹配位置延伸到下一个作用域匹配（或文件末尾）
- 如果捕获组为空，前一个作用域结束但不开始新作用域
- 带有显式命名空间分隔符的键不受作用域影响

## `monopoly`

- **类型**：`boolean`
- **默认值**：`false`

如果为 `true`，禁用所有其他内置框架（Vue I18n、react-i18next 等），仅保留自定义框架。

```yaml
# 仅使用自定义框架，禁用所有内置框架
monopoly: true
```

::: tip
如果不确定，保持 `monopoly` 为 `false`。仅在内置框架导致错误的键检测时设为 `true`。
:::

## 热重载

自定义框架配置支持热重载。对 YAML 文件的任何修改都会自动触发重新加载——无需重启 VS Code 或重新加载窗口。

## 相关设置

以下 `settings.json` 中的 VS Code 设置通常与自定义框架配合使用：

| 设置项 | 说明 |
| --- | --- |
| [`localesPaths`](/zh-CN/config/settings#localespaths) | locale 文件路径 |
| [`sourceLanguage`](/zh-CN/config/settings#sourcelanguage) | 源语言代码（如 `en`） |
| [`pathMatcher`](/zh-CN/config/settings#pathmatcher) | locale 文件路径模式（如 `{locale}/{namespace}.json`） |
| [`keystyle`](/zh-CN/config/settings#keystyle) | 键风格：`nested`、`flat` 或 `auto` |
| [`dirStructure`](/zh-CN/config/settings#dirstructure) | 目录结构：`file` 或 `dir` |
| [`defaultNamespace`](/zh-CN/config/settings#defaultnamespace) | 未指定命名空间时的默认命名空间 |
| [`enabledFrameworks`](/zh-CN/config/settings#enabledframeworks) | 必须包含 `"custom"` 才能启用 |
