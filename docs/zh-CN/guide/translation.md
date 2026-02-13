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
