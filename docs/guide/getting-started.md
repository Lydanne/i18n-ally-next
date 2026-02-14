# Getting Started

## Installation

Search for **i18n Ally Next** in the VS Code Extensions panel, or install from:

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next)
- [Open VSX Registry](https://open-vsx.org/extension/lydanne/i18n-ally-next)

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
