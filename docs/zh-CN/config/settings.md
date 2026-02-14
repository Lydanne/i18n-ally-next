# .vscode/settings.json

所有配置项在 `.vscode/settings.json` 中以 `i18n-ally-next.` 为前缀。

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.localesPaths": ["src/locales"]
}
```

## 通用

### `disabled`

- **类型**：`boolean` — **默认值**：`false`

完全禁用插件。

**使用场景：** 临时禁用插件而无需卸载，例如在非 i18n 分支上工作或排查性能问题时。

```jsonc
{ "i18n-ally-next.disabled": true }
```

### `autoDetection`

- **类型**：`boolean` — **默认值**：`true`

自动检测框架和 locale 文件路径。

**使用场景：** 默认启用。插件会扫描 `package.json` 依赖来检测使用的 i18n 框架，并搜索常见目录查找 locale 文件。如果自动检测识别了错误的框架或路径，可以禁用并手动配置。

```jsonc
{
  "i18n-ally-next.autoDetection": false,
  "i18n-ally-next.enabledFrameworks": ["vue"],
  "i18n-ally-next.localesPaths": ["src/locales"]
}
```

### `localesPaths`

- **类型**：`string | string[]` — **默认值**：—

locale 文件目录路径，相对于工作区根目录。

**使用场景：** 当自动检测无法找到 locale 文件，或 locale 文件在非标准位置时需要手动指定。

```jsonc
// 单个路径
{ "i18n-ally-next.localesPaths": "src/locales" }

// 多个路径（monorepo 或拆分的 locale）
{ "i18n-ally-next.localesPaths": ["packages/app/locales", "packages/shared/locales"] }
```

### `encoding`

- **类型**：`string` — **默认值**：`"utf-8"`

读写 locale 文件的编码。

**使用场景：** 仅在 locale 文件使用非 UTF-8 编码时修改（如旧项目使用 `gbk`、`shift_jis`）。

### `readonly`

- **类型**：`boolean` — **默认值**：`false`

禁止插件写入 locale 文件。

**使用场景：** 在 CI/审阅环境中启用，或当 locale 文件由外部系统管理（如 Crowdin、Lokalise）不应在本地修改时。

```jsonc
{ "i18n-ally-next.readonly": true }
```

## 语言

### `sourceLanguage`

- **类型**：`string` — **默认值**：`"en"`

项目的主语言。这是你首先编写翻译的语言，其他语言从它翻译而来。

**使用场景：** 始终设置为项目的主语言。它决定了哪些翻译显示为"源"，哪些显示为"缺失"。

```jsonc
// 中文作为源语言
{ "i18n-ally-next.sourceLanguage": "zh-CN" }
```

### `displayLanguage`

- **类型**：`string` — **默认值**：—（回退到 `sourceLanguage`）

代码编辑器中内联注解显示的语言。

**使用场景：** 当你希望注解显示的语言与源语言不同时设置。例如，源语言是英文，但你希望在编码时看到中文翻译。

```jsonc
{
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

### `ignoredLocales`

- **类型**：`string[]` — **默认值**：`[]`

在侧边栏树视图中隐藏的语言。

**使用场景：** 隐藏未积极维护或自动生成的语言，减少侧边栏的杂乱。

```jsonc
{ "i18n-ally-next.ignoredLocales": ["test", "pseudo"] }
```

### `languageTagSystem`

- **类型**：`"bcp47" | "legacy" | "none"` — **默认值**：`"bcp47"`

语言标签规范化系统。

**使用场景：**

- `bcp47`（默认）— 规范化标签如 `zh_CN` → `zh-CN`。适用于大多数项目。
- `legacy` — 保持原始标签格式。当项目依赖非标准 locale 代码时使用。
- `none` — 完全不规范化。当 locale 代码完全自定义时使用（如 `chinese`、`english`）。

```jsonc
{ "i18n-ally-next.languageTagSystem": "none" }
```

### `localeCountryMap`

- **类型**：`object` — **默认值**：`{}`

自定义 locale 代码到国家代码的映射，用于国旗显示。

**使用场景：** 当默认国旗映射不正确时。例如，`en` 默认显示美国国旗，但你想显示英国国旗。

```jsonc
{
  "i18n-ally-next.localeCountryMap": {
    "en": "gb",
    "zh-CN": "cn",
    "zh-TW": "tw"
  }
}
```

### `showFlags`

- **类型**：`boolean` — **默认值**：`true`

在侧边栏的语言名称旁显示国旗。

**使用场景：** 如果国旗令人分心或 locale 代码无法很好地映射到国家时禁用。

## 键风格与结构

### `keystyle`

- **类型**：`"auto" | "nested" | "flat"` — **默认值**：`"auto"`

locale 文件中键的组织方式。

**使用场景：**

- `auto`（默认）— 从现有文件自动检测。
- `nested` — 键如 `settings.theme.dark` 存储为嵌套对象：`{ "settings": { "theme": { "dark": "..." } } }`。
- `flat` — 键按原样存储：`{ "settings.theme.dark": "..." }`。

```jsonc
// 强制使用扁平键风格
{ "i18n-ally-next.keystyle": "flat" }
```

### `dirStructure`

- **类型**：`"auto" | "file" | "dir"` — **默认值**：`"auto"`

locale 文件在磁盘上的组织方式。

**使用场景：**

- `auto`（默认）— 从现有结构自动检测。
- `file` — 每个语言一个文件：`en.json`、`zh-CN.json`。
- `dir` — 每个语言一个目录：`en/common.json`、`zh-CN/common.json`。

```jsonc
// 强制使用目录结构
{ "i18n-ally-next.dirStructure": "dir" }
```

### `disablePathParsing`

- **类型**：`boolean` — **默认值**：`false`

将键视为扁平字符串，不解析点路径。

**使用场景：** 当键中包含的点号不是路径分隔符时启用。例如，键 `com.example.app` 应被视为单个扁平键，而非嵌套路径。

```jsonc
{ "i18n-ally-next.disablePathParsing": true }
```

### `namespace`

- **类型**：`boolean` — **默认值**：—（按框架自动检测）

全局启用命名空间支持。

**使用场景：** 某些框架（如 i18next）会自动启用命名空间。当使用自定义框架或自动检测不正确时，需要显式设置。详见[自定义框架](/zh-CN/guide/custom-framework)。

```jsonc
{ "i18n-ally-next.namespace": true }
```

### `defaultNamespace`

- **类型**：`string` — **默认值**：—

没有显式命名空间前缀的键使用的默认命名空间。

**使用场景：** 当项目有一个"默认"命名空间，未指定命名空间的键归属于它。常见于 i18next 项目，`t("key")` 不带命名空间前缀时应解析到特定命名空间。

```jsonc
{
  "i18n-ally-next.namespace": true,
  "i18n-ally-next.defaultNamespace": "common"
}
```

### `pathMatcher`

- **类型**：`string` — **默认值**：—（自动检测）

自定义 locale 文件路径匹配模式。支持占位符：

- `{locale}` — 语言代码（如 `en`、`zh-CN`）
- `{namespace}` — 命名空间名称（如 `common`、`settings`）

**使用场景：** 当 locale 文件结构不匹配标准模式时。

```jsonc
// 标准：locales/{locale}/{namespace}.json
{ "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json" }

// 带命名空间的扁平结构：locales/{namespace}.{locale}.json
{ "i18n-ally-next.pathMatcher": "{namespace}.{locale}.json" }

// 无命名空间：locales/{locale}.json
{ "i18n-ally-next.pathMatcher": "{locale}.json" }
```

## 注解

### `annotations`

- **类型**：`boolean` — **默认值**：`true`

在代码编辑器中显示内联翻译注解。

**使用场景：** 如果注解太嘈杂或在大文件中导致性能问题时禁用。

### `annotationInPlace`

- **类型**：`boolean` — **默认值**：`true`

在编辑器显示中用翻译值替换键文本。

**使用场景：**

- `true`（默认）— 键字符串 `t("hello")` 被视觉替换为翻译值，如 `t("你好世界")`。
- `false` — 翻译显示为键后面的后缀：`t("hello") · 你好世界`。

### `annotationInPlaceFullMatch`

- **类型**：`boolean` — **默认值**：`false`

启用原位注解的全匹配模式。当整个字符串字面量是翻译键时，使用独特的颜色（`theme.annotationInPlaceFullMatch`）而非普通注解颜色。

**使用场景：** 启用后可以在视觉上区分完全是翻译键的字符串和仅包含键作为较大表达式一部分的字符串。

```jsonc
{ "i18n-ally-next.annotationInPlaceFullMatch": true }
```

### `annotationMaxLength`

- **类型**：`number` — **默认值**：`40`

注解文本的最大字符数。超长翻译会被截断为 `...`。

**使用场景：** 对于文本较长的语言（如德语）增大此值，或减小以保持注解紧凑。

```jsonc
{ "i18n-ally-next.annotationMaxLength": 80 }
```

### `annotationDelimiter`

- **类型**：`string` — **默认值**：`"·"`

注解文本前显示的分隔符（仅在 `annotationInPlace` 为 `false` 时使用）。

**使用场景：** 更改键和翻译文本之间的视觉分隔符。

```jsonc
{ "i18n-ally-next.annotationDelimiter": " → " }
```

### `annotationBrackets`

- **类型**：`[string, string]` — **默认值**：`[]`

包裹注解文本的括号符号。第一个元素为左括号，第二个为右括号。

**使用场景：** 为翻译文本添加视觉边界，使其更容易与周围代码区分。例如 `` ["`", "`"] `` 将显示为 `` `你好世界` ``。

```jsonc
// 使用反引号包裹
{ "i18n-ally-next.annotationBrackets": ["`", "`"] }

// 使用方括号包裹
{ "i18n-ally-next.annotationBrackets": ["[", "]"] }

// 使用中文括号包裹
{ "i18n-ally-next.annotationBrackets": ["「", "」"] }
```

## 主题

自定义内联注解的颜色。所有值为 CSS 颜色字符串。

### `theme.annotation`

- **类型**：`string` — **默认值**：`"rgba(153, 153, 153, .8)"`

已有翻译的注解文本颜色。

### `theme.annotationMissing`

- **类型**：`string` — **默认值**：`"rgba(153, 153, 153, .3)"`

缺失翻译的注解文本颜色。默认更暗淡，以便与已有翻译在视觉上区分。

### `theme.annotationBorder`

- **类型**：`string` — **默认值**：`"rgba(153, 153, 153, .2)"`

原位注解的边框颜色。

### `theme.annotationMissingBorder`

- **类型**：`string` — **默认值**：`"rgba(153, 153, 153, .2)"`

缺失翻译的原位注解边框颜色。

### `theme.annotationInPlaceFullMatch`

- **类型**：`string` — **默认值**：`"#ce9178"`

当整个字符串完全匹配翻译键时的原位注解颜色。

**使用场景：** 自定义以匹配你的编辑器主题。默认 `#ce9178` 是暖橙色，匹配 VS Code 暗色主题的字符串颜色。

## 框架与解析器

### `enabledFrameworks`

- **类型**：`string[]` — **默认值**：—（自动检测）

手动指定启用的 i18n 框架。

**使用场景：** 当自动检测选择了错误的框架，或需要同时启用多个框架时覆盖。

可用值：`vue`、`react`、`vscode`、`ngx-translate`、`i18next`、`react-i18next`、`i18next-shopify`、`i18n-tag`、`flutter`、`vue-sfc`、`ember`、`chrome-ext`、`ruby-rails`、`custom`、`laravel`、`transloco`、`svelte`、`globalize`、`ui5`、`next-translate`、`php-gettext`、`general`、`lingui`、`jekyll`、`fluent-vue`、`fluent-vue-sfc`、`next-intl`、`next-international`

```jsonc
// 仅使用 Vue 和自定义框架
{ "i18n-ally-next.enabledFrameworks": ["vue", "custom"] }
```

### `enabledParsers`

- **类型**：`string[]` — **默认值**：—（自动检测）

手动指定启用的文件解析器。

**使用场景：** 当只使用特定文件格式，或需要启用不常见格式的解析器时覆盖自动检测。

可用值：`js`、`ts`、`json`、`json5`、`yaml`、`ini`、`po`、`php`、`properties`、`ftl`

```jsonc
// 仅解析 JSON 和 YAML 文件
{ "i18n-ally-next.enabledParsers": ["json", "yaml"] }
```

### `parsers.extendFileExtensions`

- **类型**：`object` — **默认值**：`{}`

将自定义文件扩展名映射到现有解析器。

**使用场景：** 当 locale 文件使用插件无法识别的非标准扩展名时。

```jsonc
{
  "i18n-ally-next.parsers.extendFileExtensions": {
    "json5": "json5",
    "yml": "yaml",
    "lang": "json"
  }
}
```

### `parsers.typescript.tsNodePath`

- **类型**：`string` — **默认值**：`"node_modules/ts-node/dist/bin.js"`

ts-node 二进制文件的路径，用于解析 TypeScript locale 文件。

**使用场景：** 当 ts-node 安装在非标准位置时修改，或设为 `"ts-node"` 以使用全局安装的版本。

```jsonc
{ "i18n-ally-next.parsers.typescript.tsNodePath": "ts-node" }
```

### `parsers.typescript.compilerOptions`

- **类型**：`object` — **默认值**：`{}`

解析 TypeScript locale 文件时传递给 ts-node 的 TypeScript 编译器选项。

**使用场景：** 当 TypeScript locale 文件需要特定的编译器设置时（如自定义路径、装饰器）。

```jsonc
{
  "i18n-ally-next.parsers.typescript.compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true
  }
}
```

### `parserOptions`

- **类型**：`object` — **默认值**：`{}`

传递给所有文件解析器的通用解析器选项。

**使用场景：** 当需要全局自定义解析器行为时。特定解析器选项（如 `parsers.typescript.compilerOptions`）优先级更高。

### `frameworks.ruby-rails.scopeRoot`

- **类型**：`string` — **默认值**：`"app/views"`

Ruby on Rails 作用域解析的根目录。

**使用场景：** 当 Rails 视图在非标准目录时。插件使用此设置来解析 `t(".key")` 相对作用域键。

```jsonc
{ "i18n-ally-next.frameworks.ruby-rails.scopeRoot": "app/views" }
```

## 正则

### `regex.key`

- **类型**：`string` — **默认值**：`"[\\w.-]+"`

匹配有效键字符的正则表达式。

**使用场景：** 当键包含默认模式（单词字符、点号、连字符）未覆盖的字符时修改。例如，键包含 `:` 用于命名空间或 `/` 用于路径。

```jsonc
// 允许键中包含冒号（用于 namespace:key 模式）
{ "i18n-ally-next.regex.key": "[\\w.:-]+" }
```

### `regex.usageMatch`

- **类型**：`string[]` — **默认值**：—（来自框架）

覆盖**所有**使用匹配模式。完全替换框架的内置模式。

**使用场景：** 当需要完全控制代码中翻译键的检测方式时。使用 `{key}` 作为键模式的占位符。

::: warning
这会覆盖所有框架模式。如果只想添加额外模式，请使用 `regex.usageMatchAppend`。
:::

```jsonc
{
  "i18n-ally-next.regex.usageMatch": [
    "\\Wt\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

### `regex.usageMatchAppend`

- **类型**：`string[]` — **默认值**：`[]`

在框架内置模式的基础上追加额外的使用匹配模式。

**使用场景：** 当框架内置模式遗漏了代码中的某些翻译函数调用时。比 `regex.usageMatch` 更安全，因为不会替换现有模式。

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\WcustomTranslate\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

## 文案提取

### `extract.autoDetect`

- **类型**：`boolean` — **默认值**：`false`

打开支持的文件时自动检测硬编码字符串。

**使用场景：** 启用后可自动高亮应提取为 i18n 的字符串。在项目初始 i18n 迁移时非常有用。

### `extract.parsers.html`

- **类型**：`object` — **默认值**：`{}`

从 HTML 文件中提取硬编码字符串的解析器选项。

**使用场景：** 当需要自定义插件如何在 HTML/Vue 模板中检测可提取的字符串时。参见[解析器选项源码](https://github.com/lydanne/i18n-ally-next/blob/master/src/extraction/parsers/options.ts)。

### `extract.parsers.babel`

- **类型**：`object` — **默认值**：`{}`

从 JS/TS/JSX/TSX 文件中提取硬编码字符串的解析器选项。

**使用场景：** 当需要自定义插件如何在 JavaScript/TypeScript 文件中检测可提取的字符串时。参见[解析器选项源码](https://github.com/lydanne/i18n-ally-next/blob/master/src/extraction/parsers/options.ts)。

### `extract.scanningInclude`

- **类型**：`string[]` — **默认值**：`[]`

批量扫描硬编码字符串时包含的文件 glob 模式。

**使用场景：** 限制“扫描并提取全部”命令的范围到特定目录或文件类型。

```jsonc
{
  "i18n-ally-next.extract.scanningInclude": [
    "src/**/*.{ts,tsx,vue}"
  ]
}
```

### `extract.scanningIgnore`

- **类型**：`string[]` — **默认值**：`[]`

批量扫描硬编码字符串时忽略的文件 glob 模式。

**使用场景：** 排除“扫描并提取全部”命令中的目录或文件。

```jsonc
{
  "i18n-ally-next.extract.scanningIgnore": [
    "src/generated/**",
    "**/*.test.ts"
  ]
}
```

### `extract.keygenStrategy`

- **类型**：`"slug" | "random" | "empty" | "source"` — **默认值**：`"slug"`

提取字符串时生成键名的策略。

**使用场景：**

- `slug`（默认）— 从字符串生成可读键：`"Hello World"` → `hello_world`。
- `random` — 生成随机键：`"Hello World"` → `a3f2b1c4`。
- `empty` — 留空键名，手动输入。
- `source` — 使用源字符串作为键：`"Hello World"` → `Hello World`。

```jsonc
{ "i18n-ally-next.extract.keygenStrategy": "slug" }
```

### `extract.keygenStyle`

- **类型**：`"default" | "kebab-case" | "snake_case" | "camelCase" | "PascalCase" | "ALL_CAPS"` — **默认值**：`"default"`

生成键名的命名风格（仅在 `keygenStrategy` 为 `slug` 时生效）。

**使用场景：** 匹配项目的键命名规范。

```jsonc
// 生成 "hello-world" 而非 "hello_world"
{ "i18n-ally-next.extract.keygenStyle": "kebab-case" }
```

### `extract.keyMaxLength`

- **类型**：`number` — **默认值**：`Infinity`

生成键名的最大长度。

**使用场景：** 限制键长度以保持 locale 文件可读性，特别是从长字符串生成时。

```jsonc
{ "i18n-ally-next.extract.keyMaxLength": 50 }
```

### `extract.keyPrefix`

- **类型**：`string` — **默认值**：`""`

添加到所有生成键名的前缀。

**使用场景：** 添加模块或功能前缀以保持键的组织性。

```jsonc
// 所有提取的键将以 "settings." 开头
{ "i18n-ally-next.extract.keyPrefix": "settings." }
```

### `extract.targetPickingStrategy`

- **类型**：`"none" | "auto" | "most-similar" | "most-similar-by-key" | "file-previous" | "global-previous"` — **默认值**：`"none"`

提取时自动选择目标 locale 文件的方式。

**使用场景：**

- `none`（默认）— 始终提示用户选择。
- `auto` — 自动选择最可能的文件。
- `most-similar` — 选择现有翻译最相似的文件。
- `most-similar-by-key` — 选择键名最相似的文件。
- `file-previous` — 使用本文件上次提取的同一文件。
- `global-previous` — 使用全局上次提取的同一文件。

```jsonc
{ "i18n-ally-next.extract.targetPickingStrategy": "file-previous" }
```

### `extract.ignored`

- **类型**：`string[]` — **默认值**：`[]`

硬编码字符串检测时忽略的字符串。

**使用场景：** 排除不应提取的常见字符串（如 CSS 类名、URL、技术常量）。

```jsonc
{
  "i18n-ally-next.extract.ignored": [
    "TODO",
    "FIXME",
    "http://",
    "https://"
  ]
}
```

### `extract.ignoredByFiles`

- **类型**：`object` — **默认值**：`{}`

按文件忽略的字符串。键为 glob 模式，值为字符串数组。

**使用场景：** 当某些字符串只应在特定文件中忽略时。

```jsonc
{
  "i18n-ally-next.extract.ignoredByFiles": {
    "src/constants/**": ["DEBUG", "PRODUCTION"],
    "src/styles/**": ["flex", "grid", "block"]
  }
}
```

### `refactor.templates`

- **类型**：`object[]` — **默认值**：`[]`

自定义重构模板，可根据源上下文精细控制。

**使用场景：** 当需要根据字符串提取位置（HTML 属性、JS 字符串、JSX 文本等）使用不同的替换模板时。

每个模板对象支持：

- `source` — 上下文类型：`html-attribute`、`html-inline`、`js-string`、`js-template`、`jsx-text`
- `template` / `templates` — 替换模板，使用 `$1` 代替键
- `include` / `exclude` — 过滤文件的 glob 模式

```jsonc
{
  "i18n-ally-next.refactor.templates": [
    {
      "source": "js-string",
      "templates": ["t('$1')", "i18n.t('$1')"]
    },
    {
      "source": "jsx-text",
      "template": "{t('$1')}"
    },
    {
      "source": "html-attribute",
      "template": "$t('$1')",
      "include": ["**/*.vue"]
    }
  ]
}
```

## 翻译

### `translate.engines`

- **类型**：`string[]` — **默认值**：`["google"]`

自动翻译使用的翻译引擎。

**使用场景：** 选择最适合需求的翻译服务。可以启用多个引擎并在它们之间切换。

可用值：`google`、`google-cn`、`deepl`、`libretranslate`、`baidu`、`openai`、`ollama`、`editor-llm`

```jsonc
// 使用 DeepL 为主，Google 为备
{ "i18n-ally-next.translate.engines": ["deepl", "google"] }
```

### `translate.parallels`

- **类型**：`number` — **默认值**：`5`

并行翻译请求数。

**使用场景：** 增大以加快批量翻译，如果遇到 API 速率限制则减小。

### `translate.promptSource`

- **类型**：`boolean` — **默认值**：`false`

翻译源语言前提示确认。

**使用场景：** 作为安全措施启用，防止意外覆盖源语言翻译。

### `translate.overrideExisting`

- **类型**：`boolean` — **默认值**：`false`

自动翻译时覆盖已有翻译。

**使用场景：** 当需要重新翻译所有键而非仅缺失的键时启用。谨慎使用——这会覆盖手动编辑的翻译。

### `translate.saveAsCandidates`

- **类型**：`boolean` — **默认值**：`false`

将自动翻译的文本保存为审阅候选，而非最终翻译。

**使用场景：** 当希望机器翻译在上线前经过人工审阅时启用。与审阅系统配合使用。

### `translate.fallbackToKey`

- **类型**：`boolean` — **默认值**：`false`

当不存在翻译时使用键名作为回退文本。

**使用场景：** 在开发阶段，当键名足够描述性可以作为占位文本时有用。

### 翻译引擎配置

#### Google 翻译

```jsonc
{
  "i18n-ally-next.translate.engines": ["google"],
  "i18n-ally-next.translate.google.apiKey": "YOUR_API_KEY"
}
```

- `translate.google.apiKey` — Google Cloud Translation API 密钥。不提供密钥时使用免费（非官方）API，可能有速率限制。

#### Google 翻译（中国）

```jsonc
{ "i18n-ally-next.translate.engines": ["google-cn"] }
```

使用 `translate.google.cn` 端点。无需 API 密钥。适合中国大陆用户。

#### DeepL

```jsonc
{
  "i18n-ally-next.translate.engines": ["deepl"],
  "i18n-ally-next.translate.deepl.apiKey": "YOUR_API_KEY",
  "i18n-ally-next.translate.deepl.useFreeApiEntry": true
}
```

- `translate.deepl.apiKey` — DeepL API 认证密钥（必填）。
- `translate.deepl.useFreeApiEntry` — 使用 DeepL Free 计划时设为 `true`。
- `translate.deepl.enableLog` — 启用 DeepL 请求的调试日志。

#### 百度翻译

```jsonc
{
  "i18n-ally-next.translate.engines": ["baidu"],
  "i18n-ally-next.translate.baidu.appid": "YOUR_APP_ID",
  "i18n-ally-next.translate.baidu.apiSecret": "YOUR_API_SECRET"
}
```

- `translate.baidu.appid` — 百度翻译 App ID。
- `translate.baidu.apiSecret` — 百度翻译 API Secret。

#### LibreTranslate

```jsonc
{
  "i18n-ally-next.translate.engines": ["libretranslate"],
  "i18n-ally-next.translate.libre.apiRoot": "http://localhost:5000"
}
```

- `translate.libre.apiRoot` — LibreTranslate 服务器地址。默认 `http://localhost:5000`，用于自托管实例。

#### OpenAI

```jsonc
{
  "i18n-ally-next.translate.engines": ["openai"],
  "i18n-ally-next.translate.openai.apiKey": "YOUR_API_KEY",
  "i18n-ally-next.translate.openai.apiRoot": "https://api.openai.com",
  "i18n-ally-next.translate.openai.apiModel": "gpt-3.5-turbo"
}
```

- `translate.openai.apiKey` — OpenAI API 密钥（必填）。
- `translate.openai.apiRoot` — API 端点。可更改为 Azure OpenAI 或兼容 API。
- `translate.openai.apiModel` — 使用的模型。

#### Ollama

```jsonc
{
  "i18n-ally-next.translate.engines": ["ollama"],
  "i18n-ally-next.translate.ollama.apiRoot": "http://localhost:11434",
  "i18n-ally-next.translate.ollama.model": "qwen2.5:latest"
}
```

- `translate.ollama.apiRoot` — Ollama 服务器地址。默认 `http://localhost:11434`。
- `translate.ollama.model` — 模型名称。需先通过 `ollama pull` 在本地拉取。

#### 编辑器内置 LLM（VS Code）

```jsonc
{
  "i18n-ally-next.translate.engines": ["editor-llm"],
  "i18n-ally-next.translate.editor-llm.model": ""
}
```

- `translate.editor-llm.model` — 首选语言模型 ID。留空则从可用的 VS Code 语言模型中自动选择。

## 审阅

### `review.enabled`

- **类型**：`boolean` — **默认值**：`true`

启用翻译审阅系统。

**使用场景：** 审阅系统允许团队成员批准、拒绝或评论翻译。如果不需要审阅工作流则禁用。

### `review.gutters`

- **类型**：`boolean` — **默认值**：`true`

在编辑器行号栏显示审阅状态图标。

**使用场景：** 如果行号栏图标与其他插件一起太嘈杂时禁用。

### `review.user.name`

- **类型**：`string` — **默认值**：—（来自 `git config user.name`）

审阅评论的审阅者名称。

**使用场景：** 当 git 配置名称与你偏好的审阅者身份不匹配时覆盖。

### `review.user.email`

- **类型**：`string` — **默认值**：—（来自 `git config user.email`）

审阅评论的审阅者邮箱。

### `review.removeCommentOnResolved`

- **类型**：`boolean` — **默认值**：`false`

解决审阅评论时删除它们。

**使用场景：** 启用以保持审阅文件整洁。禁用时，已解决的评论会保留在文件中，带有"已解决"状态。

## 文件写入

### `indent`

- **类型**：`number` — **默认值**：`2`

写入 locale 文件时的缩进大小（空格或制表符数量）。

**使用场景：** 匹配项目的代码风格。常见值：`2` 或 `4`。

### `tabStyle`

- **类型**：`"space" | "tab"` — **默认值**：`"space"`

locale 文件中使用空格还是制表符缩进。

### `sortKeys`

- **类型**：`boolean` — **默认值**：`false`

写入 locale 文件时按字母顺序排序键。

**使用场景：** 启用以保持 locale 文件中一致的键顺序，使 diff 更清晰并减少合并冲突。

```jsonc
{ "i18n-ally-next.sortKeys": true }
```

### `sortCompare`

- **类型**：`"binary" | "locale"` — **默认值**：`"binary"`

排序键的比较方法。

**使用场景：**

- `binary`（默认）— 简单的逐字节比较。快速且确定性。
- `locale` — 使用 `Intl.Collator` 的语言感知比较。对非 ASCII 键更好。

### `sortLocale`

- **类型**：`string` — **默认值**：—

语言感知排序使用的语言（仅在 `sortCompare` 为 `"locale"` 时生效）。

```jsonc
{
  "i18n-ally-next.sortCompare": "locale",
  "i18n-ally-next.sortLocale": "zh-CN"
}
```

### `keepFulfilled`

- **类型**：`boolean` — **默认值**：`false`

在"待处理"列表中保留已完全翻译的键。

**使用场景：** 当需要审阅所有键而非仅缺失的键时启用。

## 使用分析

### `keysInUse`

- **类型**：`string[]` — **默认值**：`[]`

手动标记为"使用中"的键。这些键即使没有找到代码引用也不会被报告为未使用。

**使用场景：** 标记动态使用的键（如计算键、来自 API 响应的键），这些键无法通过静态分析检测到。

```jsonc
{
  "i18n-ally-next.keysInUse": [
    "errors.*",
    "dynamic.key.prefix.*"
  ]
}
```

### `usage.derivedKeyRules`

- **类型**：`string[]` — **默认值**：—

派生键的规则，如复数或上下文变体。

**使用场景：** 当 i18n 库生成派生键（如 `key_one`、`key_other` 用于复数），如果基础键被使用则这些派生键也应被视为"使用中"。

```jsonc
{
  "i18n-ally-next.usage.derivedKeyRules": [
    "{key}_one",
    "{key}_other",
    "{key}_zero",
    "{key}_many"
  ]
}
```

### `usage.scanningIgnore`

- **类型**：`string[]` — **默认值**：`[]`

扫描键使用时忽略的 glob 模式。

**使用场景：** 排除生成文件、构建输出或测试 fixture 的使用扫描。

```jsonc
{
  "i18n-ally-next.usage.scanningIgnore": [
    "dist/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

## 其他

### `preferredDelimiter`

- **类型**：`string` — **默认值**：`"-"`

规范化时 locale 代码的首选分隔符。

**使用场景：** 控制 locale 代码的格式化方式。例如 `zh_CN` vs `zh-CN`。默认 `-` 生成 BCP47 风格的代码。

### `fullReloadOnChanged`

- **类型**：`boolean` — **默认值**：`false`

任何文件变更时触发所有 locale 文件的完全重新加载。

**使用场景：** 如果编辑 locale 文件后遇到数据过时的问题则启用。这更慢但更可靠。通常不需要。

### `includeSubfolders`

- **类型**：`boolean` — **默认值**：`true`

扫描 locale 文件时包含子文件夹。

**使用场景：** 如果有深层嵌套目录且只想扫描顶层 locale 目录时禁用。

### `ignoreFiles`

- **类型**：`string[]` — **默认值**：`[]`

忽略 locale 文件的 glob 模式。

**使用场景：** 排除特定 locale 文件不被加载，如生成文件或备份文件。

```jsonc
{
  "i18n-ally-next.ignoreFiles": [
    "**/*.backup.json",
    "**/generated/**"
  ]
}
```

### `editor.preferEditor`

- **类型**：`boolean` — **默认值**：`false`

编辑翻译时优先使用内置编辑器 UI 而非 VS Code 的快速输入。

**使用场景：** 如果你偏好使用插件的自定义编辑器面板而非内联快速输入对话框来获得更丰富的编辑体验时启用。
