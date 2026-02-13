# Machine Translation

i18n Ally Next supports multiple translation engines to automatically translate missing keys.

## Supported Engines

| Engine | Config Key | Requires API Key |
| --- | --- | --- |
| **Google Translate** | `google` | Optional |
| **Google Translate (CN)** | `google-cn` | Optional |
| **DeepL** | `deepl` | ✅ |
| **Baidu** | `baidu` | ✅ |
| **LibreTranslate** | `libretranslate` | - (self-hosted) |
| **OpenAI** | `openai` | ✅ |
| **Editor LLM** | `editor-llm` | - (uses built-in Copilot) |

## Configuration

### Select Engines

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.translate.engines": ["google"]
}
```

### API Keys

```jsonc
{
  // Google (optional, for higher rate limits)
  "i18n-ally-next.translate.google.apiKey": "YOUR_KEY",

  // DeepL
  "i18n-ally-next.translate.deepl.apiKey": "YOUR_KEY",
  "i18n-ally-next.translate.deepl.useFreeApiEntry": false,

  // Baidu
  "i18n-ally-next.translate.baidu.appid": "YOUR_APPID",
  "i18n-ally-next.translate.baidu.apiSecret": "YOUR_SECRET",

  // LibreTranslate
  "i18n-ally-next.translate.libre.apiRoot": "http://localhost:5000",

  // OpenAI
  "i18n-ally-next.translate.openai.apiKey": "YOUR_KEY",
  "i18n-ally-next.translate.openai.apiRoot": "https://api.openai.com",
  "i18n-ally-next.translate.openai.apiModel": "gpt-3.5-turbo",

  // Editor LLM (Cursor / Windsurf / VS Code Copilot)
  "i18n-ally-next.translate.editor-llm.model": "" // leave empty to auto-select
}
```

::: tip Editor LLM Quick Setup
Run command **`i18n Ally Next: Select Editor LLM Model`** from the Command Palette (`Cmd+Shift+P`). It will list all available models, and automatically configure both the model and the engine for you.
:::

::: warning
Store API keys in **User Settings** (not Workspace Settings) to avoid committing them to version control.
:::

## Usage

### Translate a Single Key

1. Hover over an i18n key in code or locale file
2. Click the **Translate** icon (globe)
3. The translation will be applied to the missing locale

### Bulk Translation (Fulfill Keys)

1. Open the i18n Ally sidebar
2. Click the **Fulfill** button on a locale to translate all missing keys

### Options

```jsonc
{
  // Number of parallel translation requests
  "i18n-ally-next.translate.parallels": 5,

  // Prompt before translating source language
  "i18n-ally-next.translate.promptSource": false,

  // Override existing translations
  "i18n-ally-next.translate.overrideExisting": false,

  // Save translations as review candidates instead of applying directly
  "i18n-ally-next.translate.saveAsCandidates": false,

  // Use key as fallback when source text is empty
  "i18n-ally-next.translate.fallbackToKey": false
}
```
