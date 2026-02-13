# Configuration Reference

All settings are prefixed with `i18n-ally-next.` in your `.vscode/settings.json`.

## General

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disable the extension |
| `autoDetection` | `boolean` | `true` | Auto-detect frameworks and locale paths |
| `localesPaths` | `string \| string[]` | — | Paths to locale directories (relative to workspace root) |
| `encoding` | `string` | `"utf-8"` | File encoding for locale files |
| `readonly` | `boolean` | `false` | Prevent writing to locale files |

## Language

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `sourceLanguage` | `string` | `"en"` | Source language for translations |
| `displayLanguage` | `string` | — | Language shown in inline annotations |
| `ignoredLocales` | `string[]` | `[]` | Locales to hide from the sidebar |
| `languageTagSystem` | `"bcp47" \| "legacy" \| "none"` | `"bcp47"` | Language tag normalization system |
| `localeCountryMap` | `object` | `{}` | Custom locale-to-country flag mapping |
| `showFlags` | `boolean` | `true` | Show country flags in the sidebar |

## Key Style & Structure

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `keystyle` | `"auto" \| "nested" \| "flat"` | `"auto"` | Key organization style |
| `dirStructure` | `"auto" \| "file" \| "dir"` | `"auto"` | Locale directory structure |
| `disablePathParsing` | `boolean` | `false` | Treat keys as flat strings (no dot-path parsing) |
| `namespace` | `boolean` | — | Enable namespace support (auto-enabled for some frameworks) |
| `defaultNamespace` | `string` | — | Default namespace for keys without explicit prefix |
| `pathMatcher` | `string` | — | Custom path matcher pattern |

## Annotations

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `annotations` | `boolean` | `true` | Show inline annotations |
| `annotationInPlace` | `boolean` | `true` | Replace key text with translation |
| `annotationMaxLength` | `number` | `40` | Max characters for annotation text |
| `annotationDelimiter` | `string` | `"·"` | Delimiter before annotation text |

## Theme

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `theme.annotation` | `string` | `"rgba(153,153,153,.8)"` | Annotation text color |
| `theme.annotationMissing` | `string` | `"rgba(153,153,153,.3)"` | Missing translation annotation color |
| `theme.annotationBorder` | `string` | `"rgba(153,153,153,.2)"` | In-place annotation border color |
| `theme.annotationMissingBorder` | `string` | `"rgba(153,153,153,.2)"` | Missing in-place annotation border |

## Frameworks & Parsers

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `enabledFrameworks` | `string[]` | — | Manually specify frameworks |
| `enabledParsers` | `string[]` | — | Manually specify file parsers |
| `parsers.extendFileExtensions` | `object` | `{}` | Map custom extensions to parsers |

## Regex

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `regex.key` | `string` | `"[\\w.-]+"` | Regex for matching key characters |
| `regex.usageMatch` | `string[]` | — | Override all usage match patterns |
| `regex.usageMatchAppend` | `string[]` | `[]` | Append extra usage match patterns |

## Extract

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `extract.autoDetect` | `boolean` | `false` | Auto-detect hard-coded strings |
| `extract.keygenStrategy` | `"slug" \| "random"` | `"slug"` | Key generation strategy |
| `extract.keygenStyle` | `string` | `"default"` | Key name casing style |
| `extract.keyMaxLength` | `number` | `Infinity` | Max generated key length |
| `extract.keyPrefix` | `string` | `""` | Prefix for generated keys |
| `extract.targetPickingStrategy` | `string` | `"none"` | How to pick target locale file |
| `extract.ignored` | `string[]` | `[]` | Strings to ignore during extraction |
| `extract.ignoredByFiles` | `object` | `{}` | Per-file ignored strings |
| `refactor.templates` | `object[]` | `[]` | Custom refactor templates |

## Translation

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `translate.engines` | `string[]` | `["google"]` | Translation engines to use |
| `translate.parallels` | `number` | `5` | Parallel translation requests |
| `translate.promptSource` | `boolean` | `false` | Prompt before translating source |
| `translate.overrideExisting` | `boolean` | `false` | Override existing translations |
| `translate.saveAsCandidates` | `boolean` | `false` | Save as review candidates |
| `translate.fallbackToKey` | `boolean` | `false` | Use key as fallback text |
| `translate.google.apiKey` | `string` | — | Google Translate API key |
| `translate.deepl.apiKey` | `string` | — | DeepL API key |
| `translate.deepl.useFreeApiEntry` | `boolean` | `false` | Use DeepL free API |
| `translate.deepl.enableLog` | `boolean` | `false` | Enable DeepL debug logging |
| `translate.baidu.appid` | `string` | — | Baidu Translate App ID |
| `translate.baidu.apiSecret` | `string` | — | Baidu Translate API Secret |
| `translate.libre.apiRoot` | `string` | `"http://localhost:5000"` | LibreTranslate API root |
| `translate.openai.apiKey` | `string` | — | OpenAI API key |
| `translate.openai.apiRoot` | `string` | `"https://api.openai.com"` | OpenAI API root |
| `translate.openai.apiModel` | `string` | `"gpt-3.5-turbo"` | OpenAI model |
| `translate.ollama.apiRoot` | `string` | `"http://localhost:11434"` | Ollama API root URL |
| `translate.ollama.model` | `string` | `"qwen2.5:latest"` | Ollama model name |
| `translate.editor-llm.model` | `string` | `""` | Preferred language model ID for editor-llm engine (VS Code only). Leave empty to auto-select. |

## Review

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `review.enabled` | `boolean` | `true` | Enable review system |
| `review.gutters` | `boolean` | `true` | Show review gutter icons |
| `review.user.name` | `string` | — | Reviewer name (defaults to git config) |
| `review.user.email` | `string` | — | Reviewer email (defaults to git config) |
| `review.removeCommentOnResolved` | `boolean` | `false` | Remove comments when resolved |

## File Writing

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `indent` | `number` | `2` | Indentation size |
| `tabStyle` | `"space" \| "tab"` | `"space"` | Indentation character |
| `sortKeys` | `boolean` | `false` | Sort keys when writing |
| `sortCompare` | `"binary" \| "locale"` | `"binary"` | Sort comparison method |
| `sortLocale` | `string` | — | Locale for locale-aware sorting |
| `keepFulfilled` | `boolean` | `false` | Keep fulfilled keys in pending list |

## Usage Analysis

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `keysInUse` | `string[]` | `[]` | Keys manually marked as in-use |
| `usage.derivedKeyRules` | `string[]` | — | Rules for derived keys (e.g. plurals) |
| `usage.scanningIgnore` | `string[]` | `[]` | Glob patterns to ignore when scanning usage |

## Other

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `preferredDelimiter` | `string` | `"-"` | Preferred delimiter for locale codes |
| `fullReloadOnChanged` | `boolean` | `false` | Full reload on any file change |
| `includeSubfolders` | `boolean` | `true` | Include subfolders when scanning |
| `ignoreFiles` | `string[]` | `[]` | Glob patterns for files to ignore |
| `editor.preferEditor` | `boolean` | `false` | Prefer editor UI over quick input |
