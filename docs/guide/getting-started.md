# Getting Started

## Installation

Search for **i18n Ally Next** in the VS Code Extensions panel, or install from:

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next)
- [Open VSX Registry](https://open-vsx.org/extension/lydanne/i18n-ally-next)

<p style="display:flex;gap:2px"><a href="https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next" target="_blank"><img src="https://img.shields.io/visual-studio-marketplace/v/lydanne.i18n-ally-next?label=Marketplace&logo=visual-studio-code&color=007ACC" alt="Marketplace"></a> <a href="https://open-vsx.org/extension/lydanne/i18n-ally-next" target="_blank"><img src="https://img.shields.io/open-vsx/v/lydanne/i18n-ally-next?label=Open%20VSX&color=c160ef" alt="Open VSX"></a> <a href="https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next" target="_blank"><img src="https://img.shields.io/visual-studio-marketplace/i/lydanne.i18n-ally-next?color=4CAF50" alt="Installs"></a> <a href="https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next" target="_blank"><img src="https://img.shields.io/visual-studio-marketplace/r/lydanne.i18n-ally-next?color=FFB400" alt="Rating"></a> <a href="https://github.com/lydanne/i18n-ally-next/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/lydanne/i18n-ally-next?color=blue" alt="License"></a></p>

## Basic Setup

### 1. Framework Detection

i18n Ally Next automatically detects the i18n framework you are using by reading your `package.json` dependencies. Supported frameworks include Vue I18n, React I18next, Next-intl, Angular ngx-translate, and [many more](/guide/supported-frameworks).

If auto-detection doesn't work, you can manually specify the framework:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["react-i18next"]
}
```

### 2. Configure Locale Paths

The extension will try to auto-detect your locale files. If it fails, set the path manually:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"]
}
```

### 3. Set Source Language

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.sourceLanguage": "en"
}
```

### 4. Set Display Language

The display language is the language shown in inline annotations:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

## Directory Structure

i18n Ally Next supports two directory structures:

### File Mode

Each locale is a single file:

```text
locales/
├── en.json
├── zh-CN.json
└── ja.json
```

### Directory Mode

Each locale is a directory containing multiple namespace files:

```text
locales/
├── en/
│   ├── common.json
│   └── review.json
├── zh-CN/
│   ├── common.json
│   └── review.json
```

Set it explicitly if auto-detection doesn't work:

```jsonc
{
  "i18n-ally-next.dirStructure": "dir"
}
```

## Key Style

- **nested** — Keys are organized hierarchically: `{ "common": { "ok": "OK" } }`, referenced as `common.ok`
- **flat** — Keys are flat strings: `{ "common.ok": "OK" }`, referenced as `common.ok`

```jsonc
{
  "i18n-ally-next.keystyle": "nested"
}
```

## What's Next?

- [Namespace Support](/guide/namespace) — Organize translations with `t("ns:key")`
- [Custom Framework](/guide/custom-framework) — Define your own framework
- [Configuration Reference](/config/) — All available settings
