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
| **Ollama** | `ollama` | - (local, free) |
| **Editor LLM** | `editor-llm` | - (uses built-in Copilot, VS Code only) |

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

  // Ollama (local LLM)
  "i18n-ally-next.translate.ollama.apiRoot": "http://localhost:11434",
  "i18n-ally-next.translate.ollama.model": "qwen2.5:latest",

  // Editor LLM (VS Code + Copilot only)
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

### Translate All Missing Keys

When you add a new language or need to catch up on translations, use the **Translate All Missing** command:

1. Run `i18n Ally Next: Translate All Missing Keys` from the Command Palette
2. Select one or more target languages (each shows its current translation progress percentage)
3. The extension automatically collects all **missing keys**, **empty-value keys**, and **stale translations**
4. All collected keys are sent to the translation engine in one batch

You can also trigger this from the sidebar — right-click a locale in the progress view and select **Translate All Missing**.

### DeepL Usage Query

When using the DeepL engine, you can check your API usage at any time:

- Run `i18n Ally Next: DeepL Usage` from the Command Palette
- Shows your used character count and total quota

### Editor LLM Model Selection

When using the Editor LLM engine, interactively select which model to use:

- Run `i18n Ally Next: Select Editor LLM Model` from the Command Palette
- Lists all available models with name, ID, vendor, and family
- After selection, the model is automatically written to your config

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

## Stale Translation Detection

When the source language text changes, existing translations in other languages may become outdated. i18n Ally Next can detect these stale translations.

### How It Works

1. The extension maintains a **source language snapshot** for each key (stored in the review data file)
2. When you run the check command, it compares the snapshot with the current source value
3. Keys whose source text has changed since the last snapshot are flagged as stale

### Running the Check

Run `i18n Ally Next: Check Stale Translations` from the Command Palette.

If stale translations are found, you'll be prompted with three options:

- **Retranslate All** — Send all stale keys to the translation engine for re-translation across all target languages
- **Review One by One** — Step through each stale key, seeing the old and new source text, and decide whether to retranslate or skip
- **Update Snapshot Only** — If the translations are still valid despite the source change, update the baseline without retranslating

If no stale translations are found, you'll be offered to **initialize snapshots** for all keys — this sets the baseline for future detection.

::: tip
Run stale translation checks as part of your release workflow to ensure all translations are up to date before shipping.
:::
