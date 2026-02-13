# 自定义框架

如果你的 i18n 方案不在内置支持列表中，可以通过 YAML 配置文件定义自定义框架。

## 适用场景

i18n Ally Next 内置支持了许多主流框架（Vue I18n、react-i18next、next-intl、Angular 等）。如果你使用的是内置框架，则**不需要**自定义框架。

以下场景适合使用自定义框架：

- **自研 i18n 库** — 项目使用自研或小众的翻译库，有自己的 `t()` 函数
- **CLI / Node.js 工具** — 项目是命令行工具或后端服务，使用自定义翻译函数，不属于 Web 框架
- **非标准函数名** — 翻译函数名称不同于常见的 `t()`（如 `translate()`、`msg()`、`i18n()`），内置框架无法识别
- **多种翻译模式混用** — 项目中混合使用多种翻译函数风格，没有单一内置框架能全部覆盖
- **自定义命名空间分隔符** — i18n 键使用非标准的命名空间分隔符（如 `t("ns:key")`），内置框架不支持

::: tip
在创建自定义框架之前，可以先查看[支持的框架](/zh-CN/guide/supported-frameworks)页面，确认你的框架是否已被内置支持。
:::

## 配置文件

在项目根目录创建 `.vscode/i18n-ally-next-custom-framework.yml`：

```yaml
# 启用注解的语言 ID
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact

# 检测代码中 i18n 键的正则表达式
# 使用 {key} 作为键的占位符
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"

# 提取文案时的重构模板
# 使用 $1 作为键的占位符
refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"

# 启用命名空间支持
namespace: true

# 命名空间分隔符（默认: "."）
namespaceDelimiter: ":"

# 检测作用域范围的正则表达式
# 第一个捕获组为命名空间名称
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"

# 设为 true 时禁用所有其他框架
monopoly: false
```

## 配置项参考

### `languageIds`

- **类型**：`string | string[]`
- **必填**：是

VS Code 语言 ID，决定哪些文件类型会启用注解、补全和内联翻译显示。

**使用场景：** 必须设置此选项，插件才知道要扫描哪些文件。只有匹配这些语言 ID 的文件才会显示内联翻译和代码补全。

**场景 1** — 纯 TypeScript 后端项目：

```yaml
languageIds: typescript
```

**场景 2** — React 项目，包含 `.ts` 和 `.tsx` 文件：

```yaml
languageIds:
  - typescript
  - typescriptreact
```

**场景 3** — 全栈项目，包含多种文件类型：

```yaml
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact
  - vue
```

支持的值：`javascript`、`typescript`、`javascriptreact`、`typescriptreact`、`vue`、`vue-html`、`json`、`html`、`dart`、`php`、`ejs`、`ruby`、`erb`、`html.erb`、`js.erb`、`haml`、`slim`、`handlebars`、`blade`、`svelte`、`xml`

### `usageMatchRegex`

- **类型**：`string | string[]`
- **必填**：是

检测代码中 i18n 键的正则表达式。使用 `{key}` 作为占位符，运行时会被替换为实际的键匹配模式（可通过 `i18n-ally-next.regex.key` 配置）。

正则表达式**必须**包含一个捕获组 `({key})` 来提取键值。

**使用场景：** 这是核心配置，告诉插件如何在代码中找到翻译键。你需要编写一个匹配项目翻译函数调用模式的正则表达式。

**场景 1** — 简单的 `t()` 函数，大多数 i18n 库的常见模式：

```yaml
# 匹配：t('hello')、t("hello")、t(`hello`)
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
```

```typescript
const msg = t('hello.world')  // ✅ 被检测到
```

**场景 2** — 对象方法调用，如 `i18n.t()`：

```yaml
# 匹配：i18n.t('key')、this.i18n.t('key')
usageMatchRegex:
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
```

```typescript
const msg = i18n.t('hello.world')  // ✅ 被检测到
```

**场景 3** — 同一项目中有多种翻译模式：

```yaml
# 有些文件用 t()，有些用 i18n.t() 或 $t()
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  - "\\$t\\(\\s*['\"`]({key})['\"`]"
```

**场景 4** — 装饰器或注释标注模式：

```yaml
# 匹配：/* i18n */ 'key'（注释标注模式）
usageMatchRegex:
  - "/\\*\\s*i18n\\s*\\*/\\s*['\"`]({key})['\"`]"
```

```typescript
const label = /* i18n */ 'button.submit'  // ✅ 被检测到
```

::: tip
`\\W` 匹配非单词字符，防止误匹配如 `ият('...')` 这样的情况。如果你的函数名出现在行首，可以使用 `(?:^|\\W)` 代替。
:::

::: warning
YAML 中需要对反斜杠进行转义。正则表达式 `\W` 在 YAML 中必须写成 `\\W`。
:::

### `refactorTemplates`

- **类型**：`string[]`
- **默认值**：`["$1"]`

"提取为 i18n"重构时的模板。当你选中代码中的硬编码字符串并执行提取命令时，插件会提供这些模板作为替换选项。使用 `$1` 作为键的占位符。

**使用场景：** 设置此项以匹配项目的翻译函数风格，使提取的字符串被替换为正确的函数调用格式。

**场景 1** — 标准 TypeScript 项目，使用 `t()`：

```yaml
refactorTemplates:
  - "t('$1')"
```

```typescript
// 提取前：const msg = "Hello World"
// 提取后：const msg = t('hello_world')
```

**场景 2** — React JSX 项目，需要普通和 JSX 表达式两种格式：

```yaml
refactorTemplates:
  - "t('$1')"       # 用于 JS 逻辑
  - "{t('$1')}"     # 用于 JSX 模板
```

```tsx
// JS 中：  const msg = t('hello')
// JSX 中：<p>{t('hello')}</p>
```

**场景 3** — Vue 项目，使用 `$t()`：

```yaml
refactorTemplates:
  - "$t('$1')"
```

### `namespace`

- **类型**：`boolean`
- **默认值**：`false`

启用命名空间支持。启用后，每个 locale 文件的文件名（不含扩展名）会被视为其命名空间。

**使用场景：** 当项目按模块或功能将翻译拆分为多个文件时启用（如 `common.json`、`settings.json`、`auth.json`），每个文件代表一个逻辑模块。

**场景 1** — 大型项目，翻译按功能模块拆分：

```yaml
namespace: true
```

```text
locales/
├── en/
│   ├── common.json      ← 命名空间："common"
│   ├── auth.json        ← 命名空间："auth"
│   └── settings.json    ← 命名空间："settings"
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

**场景 2** — CLI 工具，命令拆分为独立的 locale 文件：

```yaml
namespace: true
namespaceDelimiter: ":"
```

```typescript
t('review:description')  // → review.json → { "description": "..." }
t('deploy:options.env')  // → deploy.json → { "options": { "env": "..." } }
```

**不需要命名空间** — 每个语言只有一个翻译文件时，无需启用：

```text
locales/
├── en.json       ← 所有键在一个文件中
└── zh-CN.json
```

::: tip
使用命名空间时，需要在 VS Code 设置中配置 `pathMatcher` 以匹配目录结构：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json"
}
```

:::

### `namespaceDelimiter`

- **类型**：`string`
- **默认值**：`"."`

**代码中**用于分隔命名空间和键的分隔符。告诉插件如何将 `t("命名空间<分隔符>键")` 解析为命名空间部分和键部分。

**使用场景：** 当翻译函数使用非点号字符分隔命名空间和键时设置。常见于使用 `:` 的 i18next 风格库，或使用 `/` 的路径风格库。

**场景 1** — i18next 风格，使用 `:` 分隔符：

```yaml
namespaceDelimiter: ":"
```

```typescript
t('common:ok')       // 命名空间 = "common"，键 = "ok"
t('auth:login.btn')  // 命名空间 = "auth"，  键 = "login.btn"
```

**场景 2** — 路径风格，使用 `/` 分隔符：

```yaml
namespaceDelimiter: "/"
```

```typescript
t('common/ok')       // 命名空间 = "common"，键 = "ok"
t('auth/login.btn')  // 命名空间 = "auth"，  键 = "login.btn"
```

**场景 3** — 默认 `.` 分隔符（无需设置）：

```typescript
t('common.ok')       // 命名空间 = "common"，键 = "ok"
// ⚠️ 有歧义："common" 是命名空间还是嵌套键？
// 建议使用其他分隔符来避免歧义。
```

| 分隔符 | 代码示例 | Locale 文件 |
| --- | --- | --- |
| `:` | `t("common:title")` | `common.json` → `{ "title": "..." }` |
| `.` | `t("common.title")` | `common.json` → `{ "title": "..." }` |
| `/` | `t("common/title")` | `common.json` → `{ "title": "..." }` |

::: warning
`namespaceDelimiter` 仅在 `namespace` 设为 `true` 时生效。
:::

### `scopeRangeRegex`

- **类型**：`string`
- **默认值**：无

检测代码中命名空间作用域范围的正则表达式。**第一个捕获组**必须是命名空间名称。检测到作用域后，该范围内的所有 `t()` 调用会自动加上命名空间前缀——无需在每个键中手动写命名空间。

**使用场景：** 当项目中有某个函数或 Hook 用于设置"当前命名空间"时使用，如 React 的 `useTranslation()` 或自定义的 `useMessages()` Hook。

**场景 1** — React 风格的 `useTranslation` Hook：

```yaml
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"
```

```tsx
const { t } = useTranslation("settings")

t("title")        // → 自动解析为 "settings.title"
t("theme.dark")   // → 自动解析为 "settings.theme.dark"

// 显式命名空间仍然有效——覆盖作用域
t("common:ok")    // → 解析为 "common.ok"（而非 "settings.common.ok"）
```

**场景 2** — 自定义 `useMessages` Hook：

```yaml
scopeRangeRegex: "useMessages\\(['\"](.+?)['\"]\\)"
```

```tsx
const t = useMessages("dashboard")

t("title")        // → "dashboard.title"
t("stats.total")  // → "dashboard.stats.total"
```

**场景 3** — 同一文件中有多个作用域：

```tsx
// 作用域 1："header"
const headerT = useTranslation("header")
headerT("logo")    // → "header.logo"
headerT("nav")     // → "header.nav"

// 作用域 2："footer"——上一个作用域在此结束
const footerT = useTranslation("footer")
footerT("links")   // → "footer.links"
```

**作用域范围的工作原理：**

- 每次正则匹配都会开始一个新的作用域范围
- 作用域从匹配位置延伸到下一个作用域匹配处（或文件末尾）
- 如果捕获组为空，则上一个作用域结束，不会开始新的作用域
- 包含显式命名空间分隔符的键不受作用域影响

### `monopoly`

- **类型**：`boolean`
- **默认值**：`false`

设为 `true` 时，禁用所有其他内置框架（Vue I18n、react-i18next 等），仅保留自定义框架。

**使用场景：** 当项目使用完全自定义的 i18n 方案，且内置框架检测导致误报或冲突时启用。

**场景 1** — CLI 工具，有自己的 i18n 系统，不涉及 Web 框架：

```yaml
monopoly: true
```

插件不会尝试检测 Vue、React、Angular 等。只使用你的自定义正则模式。

**场景 2** — 项目使用 Web 框架，但有自定义 i18n 封装：

```yaml
# 不设置 monopoly，让两个框架共存
monopoly: false
```

```jsonc
// .vscode/settings.json — 同时启用两者
{
  "i18n-ally-next.enabledFrameworks": ["vue", "custom"]
}
```

::: tip
如果不确定，保持 `monopoly` 为 `false`。只有在看到内置框架产生错误的键检测时才设为 `true`。
:::

## 示例

### 简单的 `t()` 函数

使用简单 `t()` 翻译函数的项目最小配置：

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

### 带 `:` 分隔符的命名空间

适用于使用 `:` 分隔命名空间和键的项目，如 `t("review:description")`：

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

### 基于作用域的命名空间

适用于通过函数调用（如 React Hook）确定命名空间的项目：

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

// 键自动限定在 "settings" 命名空间下
t("title")       // → 解析为 "settings.title"
t("theme.dark")  // → 解析为 "settings.theme.dark"
```

### 多种翻译函数

适用于有多种翻译模式的项目：

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

## 启用自定义框架

两种方式：

1. **自动检测** — 只需创建 YAML 文件，插件会自动检测
2. **手动指定** — 在启用的框架列表中添加 `"custom"`：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["custom"]
}
```

::: tip
自定义框架可以与内置框架共存。例如，可以同时使用 `vue` 和 `custom` 框架：

```jsonc
{
  "i18n-ally-next.enabledFrameworks": ["vue", "custom"]
}
```

如果希望自定义框架是唯一的框架，在 YAML 配置中设置 `monopoly: true`。
:::

## 相关设置

以下 VS Code 设置常与自定义框架配合使用：

| 设置项 | 说明 |
| --- | --- |
| `i18n-ally-next.localesPaths` | locale 文件路径 |
| `i18n-ally-next.sourceLanguage` | 源语言代码（如 `en`） |
| `i18n-ally-next.pathMatcher` | locale 文件路径模式（如 `{locale}/{namespace}.json`） |
| `i18n-ally-next.keystyle` | 键风格：`nested`、`flat` 或 `auto` |
| `i18n-ally-next.dirStructure` | 目录结构：`file` 或 `dir` |
| `i18n-ally-next.defaultNamespace` | 未指定命名空间时的默认命名空间 |
| `i18n-ally-next.namespace` | 全局启用命名空间（替代在 YAML 中设置） |

## 热重载

自定义框架配置支持热重载。修改 YAML 文件后，插件会自动重新加载——无需重启 VS Code 或重新加载窗口。
