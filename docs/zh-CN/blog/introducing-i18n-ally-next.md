# i18n Ally Next：重新定义 VS Code 国际化开发体验

<p style="color:#999;font-size:14px">2025-02-14 · Lydanne</p>

> 做国际化（i18n）是前端开发中最「看起来简单、做起来要命」的事情之一。翻译文件散落各处，键名拼写错误要到运行时才发现，新增语言要手动逐个补全，源语言改了但翻译没跟上……如果你也深有同感，这篇文章就是写给你的。

## 为什么要做 i18n Ally Next？

[i18n Ally](https://github.com/lokalise/i18n-ally) 是 VS Code 生态中最受欢迎的国际化插件之一，由 [@antfu](https://github.com/antfu) 创建。它提供了内联注解、翻译管理、文案提取等一系列强大功能，极大地提升了 i18n 开发体验。

但随着时间推移，原项目的维护逐渐放缓。社区积累了大量 Issue 和 PR 未被处理，一些现代框架（如 Next-intl、Svelte 5）的支持也迟迟没有跟上。更关键的是——**原项目没有文档站点**，所有使用说明散落在 README 和 Wiki 中，新用户上手成本很高。

**i18n Ally Next** 正是在这样的背景下诞生的——我们 fork 了原项目，在保留所有经典功能的基础上，持续修复 Bug、新增特性、改善性能，并且**从零搭建了完整的文档体系**。

## 为什么文档这么重要？

原版 i18n Ally 功能强大，但有一个致命问题：**你不知道它能做什么**。

很多开发者安装后只用到了内联注解这一个功能，对审阅系统、自定义框架、正则匹配、路径匹配等高级功能一无所知。这不是用户的问题，是文档缺失的问题。

i18n Ally Next 的文档站点从以下几个维度重新组织了内容：

### 🧱 结构化的指南体系

- **[快速开始](/zh-CN/guide/getting-started)** — 从安装到看到第一个内联注解，5 分钟搞定
- **[支持的框架](/zh-CN/guide/supported-frameworks)** — 完整列出 25+ 支持的框架及其自动检测机制
- **[语言文件格式](/zh-CN/guide/locale-formats)** — JSON、YAML、JSON5、PO、Properties、FTL……每种格式的用法和注意事项
- **[命名空间](/zh-CN/guide/namespace)** — 大型项目必备的翻译文件组织方式
- **[文案提取](/zh-CN/guide/extraction)** — 从硬编码字符串到 i18n 键的完整工作流
- **[审阅系统](/zh-CN/guide/review)** — 团队协作翻译的质量保障
- **[机器翻译](/zh-CN/guide/translation)** — 8 种翻译引擎的配置与对比

### 🏗️ 框架最佳实践

不同框架的 i18n 方案差异很大。我们为每个主流框架编写了专属的最佳实践指南：

- **[Vue I18n](/zh-CN/guide/frameworks/vue)** — SFC `<i18n>` 块、Composition API、Nuxt I18n
- **[React & Next.js](/zh-CN/guide/frameworks/react)** — react-i18next、Next-intl、Next-international
- **[Angular](/zh-CN/guide/frameworks/angular)** — ngx-translate、Transloco
- **[Svelte、Laravel 与 Rails](/zh-CN/guide/frameworks/others)** — 各有专属配置示例
- **[自定义框架](/zh-CN/guide/frameworks/custom)** — 从零配置到完整运行的实战教程

### 📋 完整的配置参考

每一个配置项都有：类型、默认值、使用场景说明和代码示例。不再需要猜测某个配置是干什么的。

- **[settings.json 配置](/zh-CN/config/settings)** — 100+ 配置项的完整参考
- **[自定义框架配置](/zh-CN/config/custom-framework)** — YAML 配置文件的每个字段详解

## 新增功能详解

### 🤖 Editor LLM：零配置 AI 翻译

这是 i18n Ally Next 最具创新性的功能之一。它直接调用你编辑器内置的大语言模型进行翻译——**无需 API Key，无需额外配置**。

```jsonc
{ "i18n-ally-next.translate.engines": ["editor-llm"] }
```

它会自动检测你的编辑器环境：

- **VS Code** — 调用 GitHub Copilot
- **Cursor** — 调用 Cursor 内置模型
- **Windsurf** — 调用 Windsurf 内置模型

更强大的是，Editor LLM 支持**批量翻译**。当你选择翻译多个键时，它会将同一语言对的翻译请求合并为一次 API 调用，按 JSON 格式批量处理，大幅提升翻译速度并降低 token 消耗。

你也可以指定模型：

```jsonc
{ "i18n-ally-next.translate.editor-llm.model": "gpt-4o" }
```

### 🦙 Ollama：完全离线的本地翻译

对于有数据安全要求的团队，Ollama 引擎让你可以使用本地部署的大模型进行翻译，**数据完全不出本机**。

```jsonc
{
  "i18n-ally-next.translate.engines": ["ollama"],
  "i18n-ally-next.translate.ollama.apiRoot": "http://localhost:11434",
  "i18n-ally-next.translate.ollama.model": "qwen2.5:latest"
}
```

通过 OpenAI 兼容 API 调用，支持任何 Ollama 上可用的模型。翻译 prompt 经过专门优化，能正确保留 `{0}`、`{name}`、`{{variable}}` 等占位符。

### 🔌 8 种翻译引擎全覆盖

| 引擎 | 特点 | 适用场景 |
| --- | --- | --- |
| **Google** | 免费、语言覆盖广 | 日常开发 |
| **Google CN** | 国内可直接访问 | 国内开发者 |
| **DeepL** | 翻译质量最佳 | 面向用户的正式翻译 |
| **OpenAI** | 灵活、可自定义 API 地址 | 需要高质量 + 自定义 |
| **Ollama** | 完全离线、数据安全 | 企业内网环境 |
| **Editor LLM** | 零配置、批量翻译 | 快速迭代 |
| **百度翻译** | 国内 API、中文优化 | 中文项目 |
| **LibreTranslate** | 开源自托管 | 完全自主可控 |

引擎可以配置多个作为 fallback：

```jsonc
{ "i18n-ally-next.translate.engines": ["editor-llm", "deepl", "google"] }
```

### 🕵️ 陈旧翻译检测

这是一个容易被忽视但极其重要的功能。当源语言的文案发生变更时，其他语言的翻译可能已经过时了——但你不会收到任何提醒。

i18n Ally Next 的陈旧翻译检测（Stale Translation Check）解决了这个问题：

1. 插件会记录每个键的**源语言快照**
2. 当你运行检测命令时，它会对比快照与当前值
3. 发现变更后，你可以选择：
   - **全部重新翻译** — 一键将所有过期翻译发送到翻译引擎
   - **逐个确认** — 逐条查看变更内容，决定是否重新翻译
   - **仅更新快照** — 确认当前翻译仍然有效，更新基准

这意味着你的翻译永远不会「悄悄过期」。

### 🔍 全项目扫描与批量提取

单文件的硬编码检测很有用，但真正的 i18n 迁移需要**全项目级别**的能力。

「扫描并提取全部」命令可以：

1. 扫描项目中所有支持的文件（可通过 glob 配置范围）
2. 检测每个文件中的硬编码字符串
3. 显示扫描结果摘要（N 个文件，M 个硬编码字符串）
4. 确认后**自动批量提取**，为每个字符串生成键名并写入 locale 文件

```jsonc
{
  "i18n-ally-next.extract.scanningInclude": ["src/**/*.{ts,tsx,vue}"],
  "i18n-ally-next.extract.scanningIgnore": ["src/generated/**"],
  "i18n-ally-next.extract.keygenStrategy": "slug",
  "i18n-ally-next.extract.keygenStyle": "camelCase"
}
```

### 📝 审阅系统（v2的功能）

翻译不是一个人的事。i18n Ally Next 内置了审阅系统（Review System），支持：

- **逐条审阅**翻译结果，标记为「通过」或「需修改」
- **留下评论**，与团队成员异步协作
- 审阅数据以 JSON 存储在项目中，**可纳入版本控制**
- 翻译结果可先保存为**候选翻译**（`translate.saveAsCandidates`），审阅通过后再正式写入

这意味着翻译质量不再是黑盒——每一条翻译都有迹可循。

### 🚀 一键翻译所有缺失

项目新增了一种语言？不用逐个键翻译。「翻译所有缺失」命令可以：

1. 选择一个或多个目标语言（显示当前翻译进度百分比）
2. 自动收集所有**缺失键**和**空值键**
3. 同时检测**过期翻译**（结合陈旧翻译检测）
4. 一键发送到翻译引擎，批量完成

配合翻译并行控制，大项目也能快速完成：

```jsonc
{
  "i18n-ally-next.translate.parallels": 5,
  "i18n-ally-next.translate.overrideExisting": false
}
```

### 🖥️ 可视化翻译编辑器

i18n Ally Next 内置了一个 Webview 翻译编辑面板，提供比 JSON 文件更直观的编辑体验：

- 通过命令面板或悬停菜单打开
- 支持**当前文件模式**（只显示当前文件中用到的键）和**独立模式**（浏览所有键）
- 实时显示所有语言的翻译值，直接编辑
- 与审阅系统联动，显示评论和候选翻译
- 配置变更时自动刷新

```jsonc
// 悬停时优先打开编辑器而非内联编辑
{ "i18n-ally-next.editor.preferEditor": true }
```

### 🧭 键名导航

在代码中快速跳转翻译键的使用位置：

- **下一个用法** (`Ctrl+Alt+→`) — 跳转到当前文件中的下一个翻译键
- **上一个用法** (`Ctrl+Alt+←`) — 跳转到上一个翻译键
- 与 Webview 编辑器联动，跳转时自动同步编辑面板

### 📊 使用报告与键管理

插件会分析项目中所有翻译键的使用情况，生成三类报告：

- **活跃键** — 代码中正在使用的键
- **闲置键** — 已定义但代码中未使用的键（可能是废弃的）
- **缺失键** — 代码中引用但 locale 文件中不存在的键

围绕这些报告，提供了一系列键管理操作：

| 操作 | 说明 |
| --- | --- |
| **复制键** | 将一个键的所有语言翻译复制到新的键路径 |
| **补全缺失键** | 为所有语言批量创建缺失的空键（方便后续翻译） |
| **标记为使用中** | 手动标记某个键为「使用中」，避免被误报为闲置（支持 glob 模式） |
| **刷新使用报告** | 重新扫描代码，更新键的使用状态 |

### 🔑 智能键名生成

从硬编码字符串提取为 i18n 键时，键名的生成策略高度可配置：

| 配置 | 说明 | 示例 |
| --- | --- | --- |
| `extract.keygenStrategy` | 生成策略：`slug`（默认）、`random`、`empty`、`source` | `"hello-world"` / `"aB3kX9"` |
| `extract.keygenStyle` | 命名风格：`default`、`camelCase`、`PascalCase`、`snake_case` 等 | `"helloWorld"` |
| `extract.keyPrefix` | 键名前缀，支持 `{fileName}` 占位符 | `"home.helloWorld"` |
| `extract.keyMaxLength` | 键名最大长度 | 截断过长的 slug |

```jsonc
{
  "i18n-ally-next.extract.keygenStrategy": "slug",
  "i18n-ally-next.extract.keygenStyle": "camelCase",
  "i18n-ally-next.extract.keyPrefix": "{fileNameWithoutExt}.",
  "i18n-ally-next.extract.keyMaxLength": 50
}
```

### 📂 批量提取（右键菜单）

除了全项目扫描，你还可以从**文件资源管理器的右键菜单**对选中的文件或文件夹进行批量提取：

- 选中多个文件/文件夹，右键 → 「Extract Hard Strings (Batch)」
- 文件夹会自动递归扫描所有文件
- 自动跳过 `.gitignore` 中的文件
- 每个文件独立检测和提取

### 🔧 DeepL 用量查询

使用 DeepL 翻译引擎时，可以随时查看 API 用量：

- 命令面板运行 `i18n Ally Next: DeepL Usage`
- 显示已用字符数和总配额

### 🤖 交互式选择 LLM 模型

使用 Editor LLM 引擎时，可以通过命令交互式选择模型：

- 命令面板运行 `i18n Ally Next: Select Editor LLM Model`
- 列出所有可用模型（名称、ID、vendor、family）
- 选择后自动写入配置，并将 `editor-llm` 加入翻译引擎列表

## 自定义框架：支持任意 i18n 方案

这是 i18n Ally Next 最灵活的功能之一。无论你使用什么 i18n 库，甚至是团队自研的方案，都可以通过一个 YAML 配置文件让插件完美支持。

### 为什么需要自定义框架？

内置框架覆盖了 25+ 主流方案，但现实中总有例外：

- 公司内部封装的 i18n 工具函数
- 使用了非标准的翻译函数名（如 `__()`, `lang()`, `msg()`）
- 新兴框架尚未被内置支持
- 需要同时匹配多种调用模式

### 如何配置？

在项目根目录创建 `.vscode/i18n-ally-next-custom-framework.yml`：

```yaml
# 指定生效的文件类型
languageIds:
  - typescript
  - typescriptreact
  - vue

# 正则匹配翻译函数调用，{key} 是占位符
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\W\\$t\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"

# 提取重构模板，$1 代表键名
refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"

# 命名空间支持
namespace: true
namespaceDelimiter: ":"

# 作用域范围检测（如 React useTranslation hook）
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"

# 是否禁用所有内置框架
monopoly: false
```

### 作用域范围是什么？

`scopeRangeRegex` 是一个非常实用的功能。以 React 为例：

```tsx
const { t } = useTranslation("settings")

t("title")        // → 自动解析为 "settings.title"
t("theme.dark")   // → 自动解析为 "settings.theme.dark"
```

插件会根据正则匹配的结果自动划分作用域范围——从匹配位置到下一个匹配位置（或文件末尾）。在作用域内的所有 `t()` 调用都会自动加上命名空间前缀。

### 热重载

修改 YAML 配置文件后**无需重启 VS Code**，插件会自动检测文件变更并重新加载。这让调试正则表达式变得非常方便——改完立刻看效果。

## 快速上手

### 安装

在 VS Code 扩展面板搜索 **i18n Ally Next**，或从以下渠道安装：

- [VS Code 插件市场](https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next)
- [Open VSX Registry](https://open-vsx.org/extension/lydanne/i18n-ally-next)

### 最小配置

对于大多数项目，你只需要两步：

**1. 指定语言文件路径**

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "zh-CN"
}
```

**2. 打开项目，开始使用**

插件会自动检测你的 i18n 框架（Vue I18n、react-i18next 等），无需额外配置。

打开任意包含翻译键的文件，你会看到：

- 🏷️ 翻译键旁边出现**内联注解**，直接显示翻译值
- 🌐 悬停键名可查看**所有语言的翻译**
- ✏️ 点击即可**编辑翻译**
- 📊 侧边栏显示**翻译进度**和缺失项

## 从 i18n Ally 迁移

如果你正在使用原版 i18n Ally，迁移非常简单：

1. 卸载 `i18n Ally`
2. 安装 `i18n Ally Next`
3. 将 `settings.json` 中的 `i18n-ally.` 前缀替换为 `i18n-ally-next.`

所有配置项保持兼容，无需其他改动。

## 写在最后

国际化不应该是痛苦的。i18n Ally Next 的目标是让 i18n 成为开发流程中自然而然的一部分——写代码时看到翻译，提交前检查缺失，源文案变更时自动提醒，协作时有据可查。

我们不只是在做一个插件，更是在构建一套**完整的 i18n 开发工具链**：从文档到配置，从检测到提取，从翻译到审阅，每一个环节都有对应的解决方案。

如果你觉得这个项目有用，欢迎：

- ⭐ 在 [GitHub](https://github.com/lydanne/i18n-ally-next) 上给我们一个 Star
- 🐛 提交 [Issue](https://github.com/lydanne/i18n-ally-next/issues) 反馈问题
- 💬 分享给你的团队和朋友
- 📖 阅读[完整文档](https://lydanne.github.io/i18n-ally-next/zh-CN/guide/getting-started)开始使用

---

*本文首发于知乎，同步发布于 [i18n Ally Next 官方文档](https://lydanne.github.io/i18n-ally-next/zh-CN/blog/introducing-i18n-ally-next)。*
