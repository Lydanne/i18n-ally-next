# 机器翻译

i18n Ally Next 支持多种翻译引擎，自动翻译缺失的键。

## 支持的引擎

| 引擎 | 配置键 | 需要 API Key |
| --- | --- | --- |
| **Google 翻译** | `google` | 可选 |
| **Google 翻译（国内）** | `google-cn` | 可选 |
| **DeepL** | `deepl` | ✅ |
| **百度翻译** | `baidu` | ✅ |
| **LibreTranslate** | `libretranslate` | -（自托管） |
| **OpenAI** | `openai` | ✅ |
| **Ollama** | `ollama` | -（本地免费） |
| **编辑器内置 LLM** | `editor-llm` | -（使用内置 Copilot，仅 VS Code） |

## 配置

### 选择引擎

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.translate.engines": ["google"]
}
```

### API Key 配置

```jsonc
{
  // Google（可选，用于提高请求限额）
  "i18n-ally-next.translate.google.apiKey": "YOUR_KEY",

  // DeepL
  "i18n-ally-next.translate.deepl.apiKey": "YOUR_KEY",
  "i18n-ally-next.translate.deepl.useFreeApiEntry": false,

  // 百度翻译
  "i18n-ally-next.translate.baidu.appid": "YOUR_APPID",
  "i18n-ally-next.translate.baidu.apiSecret": "YOUR_SECRET",

  // LibreTranslate
  "i18n-ally-next.translate.libre.apiRoot": "http://localhost:5000",

  // OpenAI
  "i18n-ally-next.translate.openai.apiKey": "YOUR_KEY",
  "i18n-ally-next.translate.openai.apiRoot": "https://api.openai.com",
  "i18n-ally-next.translate.openai.apiModel": "gpt-3.5-turbo",

  // Ollama（本地大模型）
  "i18n-ally-next.translate.ollama.apiRoot": "http://localhost:11434",
  "i18n-ally-next.translate.ollama.model": "qwen2.5:latest",

  // 编辑器内置 LLM（仅 VS Code + Copilot）
  "i18n-ally-next.translate.editor-llm.model": "" // 留空则自动选择
}
```

::: tip 编辑器 LLM 快速配置
运行命令 **`i18n Ally Next: Select Editor LLM Model`**（`Cmd+Shift+P`），会列出所有可用模型供你选择，并自动配置模型和翻译引擎。
:::

::: warning
请将 API Key 存储在 **用户设置**（而非工作区设置）中，避免提交到版本控制。
:::

## 使用方式

### 翻译单个键

1. 在代码或语言文件中悬浮在 i18n 键上
2. 点击 **翻译** 图标（地球图标）
3. 翻译结果会自动写入缺失的语言文件

### 批量翻译（填充键）

1. 打开 i18n Ally 侧边栏
2. 在某个语言上点击 **Fulfill** 按钮，翻译所有缺失的键

### 一键翻译所有缺失

当你新增了一种语言或需要补全翻译时，使用 **翻译所有缺失** 命令：

1. 运行命令面板中的 `i18n Ally Next: Translate All Missing Keys`
2. 选择一个或多个目标语言（每个语言显示当前翻译进度百分比）
3. 插件自动收集所有**缺失键**、**空值键**和**过期翻译**
4. 一键发送到翻译引擎批量完成

也可以从侧边栏触发——在进度视图中右键点击某个 locale，选择 **Translate All Missing**。

### DeepL 用量查询

使用 DeepL 引擎时，可以随时查看 API 用量：

- 运行命令面板中的 `i18n Ally Next: DeepL Usage`
- 显示已用字符数和总配额

### 编辑器 LLM 模型选择

使用 Editor LLM 引擎时，可以交互式选择模型：

- 运行命令面板中的 `i18n Ally Next: Select Editor LLM Model`
- 列出所有可用模型（名称、ID、vendor、family）
- 选择后自动写入配置

### 选项

```jsonc
{
  // 并行翻译请求数
  "i18n-ally-next.translate.parallels": 5,

  // 翻译源语言前提示确认
  "i18n-ally-next.translate.promptSource": false,

  // 覆盖已有翻译
  "i18n-ally-next.translate.overrideExisting": false,

  // 将翻译保存为审阅候选而非直接应用
  "i18n-ally-next.translate.saveAsCandidates": false,

  // 源文本为空时使用键名作为回退
  "i18n-ally-next.translate.fallbackToKey": false
}
```

## 陈旧翻译检测

当源语言文案发生变更时，其他语言的翻译可能已经过时。i18n Ally Next 可以检测这些陈旧翻译。

### 工作原理

1. 插件为每个键维护一个**源语言快照**（存储在审阅数据文件中）
2. 运行检测命令时，对比快照与当前源语言值
3. 源文本已变更的键会被标记为陈旧

### 运行检测

运行命令面板中的 `i18n Ally Next: Check Stale Translations`。

如果发现陈旧翻译，会提示三个选项：

- **全部重新翻译** — 将所有过期键发送到翻译引擎，重新翻译所有目标语言
- **逐个确认** — 逐条查看每个过期键的新旧源文本，决定是否重新翻译或跳过
- **仅更新快照** — 如果翻译仍然有效，仅更新基准而不重新翻译

如果没有发现陈旧翻译，会提供**初始化快照**的选项——为所有键设置基准，用于后续检测。

::: tip
建议将陈旧翻译检测纳入发布流程，确保发布前所有翻译都是最新的。
:::
