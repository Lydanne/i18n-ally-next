# Configuration Reference

All settings are prefixed with `i18n-ally-next.` in your `.vscode/settings.json`.

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.localesPaths": ["src/locales"]
}
```

## General

### `disabled`

- **Type**: `boolean` — **Default**: `false`

Disable the extension entirely.

**When to use:** Temporarily disable the extension for a workspace without uninstalling it, e.g. when working on a non-i18n branch or debugging performance issues.

```jsonc
{ "i18n-ally-next.disabled": true }
```

### `autoDetection`

- **Type**: `boolean` — **Default**: `true`

Automatically detect frameworks and locale file paths.

**When to use:** Enabled by default. The extension scans `package.json` dependencies to detect which i18n framework you're using and searches common directories for locale files. Disable this if auto-detection picks up wrong frameworks or paths, and configure them manually instead.

```jsonc
{
  "i18n-ally-next.autoDetection": false,
  "i18n-ally-next.enabledFrameworks": ["vue"],
  "i18n-ally-next.localesPaths": ["src/locales"]
}
```

### `localesPaths`

- **Type**: `string | string[]` — **Default**: —

Paths to locale directories, relative to workspace root.

**When to use:** Required when auto-detection can't find your locale files, or when locale files are in non-standard locations.

```jsonc
// Single path
{ "i18n-ally-next.localesPaths": "src/locales" }

// Multiple paths (monorepo or split locales)
{ "i18n-ally-next.localesPaths": ["packages/app/locales", "packages/shared/locales"] }
```

### `encoding`

- **Type**: `string` — **Default**: `"utf-8"`

File encoding for reading and writing locale files.

**When to use:** Only change this if your locale files use a non-UTF-8 encoding (e.g. `gbk`, `shift_jis` for legacy projects).

### `readonly`

- **Type**: `boolean` — **Default**: `false`

Prevent the extension from writing to locale files.

**When to use:** Enable in CI/review environments or when locale files are managed by an external system (e.g. Crowdin, Lokalise) and should not be modified locally.

```jsonc
{ "i18n-ally-next.readonly": true }
```

## Language

### `sourceLanguage`

- **Type**: `string` — **Default**: `"en"`

The primary language of your project. This is the language you write your translations in first, and other languages are translated from it.

**When to use:** Always set this to match your project's primary language. It determines which translations are shown as "source" and which are "missing".

```jsonc
// Chinese as source language
{ "i18n-ally-next.sourceLanguage": "zh-CN" }
```

### `displayLanguage`

- **Type**: `string` — **Default**: — (falls back to `sourceLanguage`)

The language shown in inline annotations in your code editor.

**When to use:** Set this when you want to see a different language in annotations than your source language. For example, your source is English but you want to see Chinese translations inline while coding.

```jsonc
{
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

### `ignoredLocales`

- **Type**: `string[]` — **Default**: `[]`

Locales to hide from the sidebar tree view.

**When to use:** Hide locales that are not actively maintained or are auto-generated, to reduce clutter in the sidebar.

```jsonc
{ "i18n-ally-next.ignoredLocales": ["test", "pseudo"] }
```

### `languageTagSystem`

- **Type**: `"bcp47" | "legacy" | "none"` — **Default**: `"bcp47"`

Language tag normalization system.

**When to use:**

- `bcp47` (default) — Normalizes tags like `zh_CN` → `zh-CN`. Best for most projects.
- `legacy` — Keeps original tag format. Use when your project relies on non-standard locale codes.
- `none` — No normalization at all. Use when locale codes are completely custom (e.g. `chinese`, `english`).

```jsonc
{ "i18n-ally-next.languageTagSystem": "none" }
```

### `localeCountryMap`

- **Type**: `object` — **Default**: `{}`

Custom mapping from locale codes to country codes for flag display.

**When to use:** When the default flag mapping is incorrect. For example, `en` defaults to the US flag, but you want the UK flag.

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

- **Type**: `boolean` — **Default**: `true`

Show country flags next to locale names in the sidebar.

**When to use:** Disable if flags are distracting or if your locale codes don't map well to countries.

## Key Style & Structure

### `keystyle`

- **Type**: `"auto" | "nested" | "flat"` — **Default**: `"auto"`

How keys are organized in locale files.

**When to use:**

- `auto` (default) — Auto-detect from existing files.
- `nested` — Keys like `settings.theme.dark` are stored as nested objects: `{ "settings": { "theme": { "dark": "..." } } }`.
- `flat` — Keys are stored as-is: `{ "settings.theme.dark": "..." }`.

```jsonc
// Force flat key style
{ "i18n-ally-next.keystyle": "flat" }
```

### `dirStructure`

- **Type**: `"auto" | "file" | "dir"` — **Default**: `"auto"`

How locale files are organized on disk.

**When to use:**

- `auto` (default) — Auto-detect from existing structure.
- `file` — One file per locale: `en.json`, `zh-CN.json`.
- `dir` — One directory per locale: `en/common.json`, `zh-CN/common.json`.

```jsonc
// Force directory-based structure
{ "i18n-ally-next.dirStructure": "dir" }
```

### `disablePathParsing`

- **Type**: `boolean` — **Default**: `false`

Treat keys as flat strings without dot-path parsing.

**When to use:** Enable when your keys contain dots that are NOT path separators. For example, if you have keys like `com.example.app` that should be treated as a single flat key, not a nested path.

```jsonc
{ "i18n-ally-next.disablePathParsing": true }
```

### `namespace`

- **Type**: `boolean` — **Default**: — (auto-detected per framework)

Enable namespace support globally.

**When to use:** Some frameworks (like i18next) auto-enable namespaces. Set this explicitly when using a custom framework or when auto-detection doesn't work correctly. See [Custom Framework](/guide/custom-framework) for details.

```jsonc
{ "i18n-ally-next.namespace": true }
```

### `defaultNamespace`

- **Type**: `string` — **Default**: —

Default namespace for keys without an explicit namespace prefix.

**When to use:** When your project has a "default" namespace that keys belong to when no namespace is specified. Common in i18next projects where `t("key")` without a namespace prefix should resolve to a specific namespace.

```jsonc
{
  "i18n-ally-next.namespace": true,
  "i18n-ally-next.defaultNamespace": "common"
}
```

### `pathMatcher`

- **Type**: `string` — **Default**: — (auto-detected)

Custom pattern for matching locale file paths. Supports placeholders:

- `{locale}` — Language code (e.g. `en`, `zh-CN`)
- `{namespace}` — Namespace name (e.g. `common`, `settings`)

**When to use:** When your locale file structure doesn't match the standard patterns.

```jsonc
// Standard: locales/{locale}/{namespace}.json
{ "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json" }

// Flat with namespace: locales/{namespace}.{locale}.json
{ "i18n-ally-next.pathMatcher": "{namespace}.{locale}.json" }

// No namespace: locales/{locale}.json
{ "i18n-ally-next.pathMatcher": "{locale}.json" }
```

## Annotations

### `annotations`

- **Type**: `boolean` — **Default**: `true`

Show inline translation annotations in the code editor.

**When to use:** Disable if annotations are too noisy or cause performance issues in large files.

### `annotationInPlace`

- **Type**: `boolean` — **Default**: `true`

Replace the key text with the translation value in the editor display.

**When to use:**

- `true` (default) — The key string `t("hello")` is visually replaced with the translation value, e.g. `t("Hello World")`.
- `false` — The translation is shown as a suffix after the key: `t("hello") · Hello World`.

### `annotationMaxLength`

- **Type**: `number` — **Default**: `40`

Maximum number of characters for annotation text. Longer translations are truncated with `...`.

**When to use:** Increase for languages with longer text (e.g. German), or decrease to keep annotations compact.

```jsonc
{ "i18n-ally-next.annotationMaxLength": 80 }
```

### `annotationDelimiter`

- **Type**: `string` — **Default**: `"·"`

The delimiter character shown before annotation text (only used when `annotationInPlace` is `false`).

**When to use:** Change the visual separator between the key and the translation text.

```jsonc
{ "i18n-ally-next.annotationDelimiter": " → " }
```

### `annotationBrackets`

- **Type**: `[string, string]` — **Default**: `[]`

Brackets to wrap annotation text. The first element is the left bracket, the second is the right bracket.

**When to use:** Add visual boundaries around translation text to make it easier to distinguish from surrounding code. For example, `` ["`", "`"] `` will display as `` `Hello World` ``.

```jsonc
// Wrap with backticks
{ "i18n-ally-next.annotationBrackets": ["`", "`"] }

// Wrap with square brackets
{ "i18n-ally-next.annotationBrackets": ["[", "]"] }

// Wrap with CJK brackets
{ "i18n-ally-next.annotationBrackets": ["「", "」"] }
```

## Theme

Customize the colors of inline annotations. All values are CSS color strings.

### `theme.annotation`

- **Type**: `string` — **Default**: `"rgba(153, 153, 153, .8)"`

Color of annotation text for existing translations.

### `theme.annotationMissing`

- **Type**: `string` — **Default**: `"rgba(153, 153, 153, .3)"`

Color of annotation text for missing translations. Dimmer by default to visually distinguish from existing ones.

### `theme.annotationBorder`

- **Type**: `string` — **Default**: `"rgba(153, 153, 153, .2)"`

Border color for in-place annotations.

### `theme.annotationMissingBorder`

- **Type**: `string` — **Default**: `"rgba(153, 153, 153, .2)"`

Border color for in-place annotations of missing translations.

### `theme.annotationInPlaceFullMatch`

- **Type**: `string` — **Default**: `"#ce9178"`

Color for in-place annotations when the full string is a translation key match.

**When to use:** Customize to match your editor theme. The default `#ce9178` is a warm orange that matches VS Code's dark theme string color.

## Frameworks & Parsers

### `enabledFrameworks`

- **Type**: `string[]` — **Default**: — (auto-detected)

Manually specify which i18n frameworks to enable.

**When to use:** Override auto-detection when it picks the wrong framework, or when you need to enable multiple frameworks simultaneously.

Available values: `vue`, `react`, `vscode`, `ngx-translate`, `i18next`, `react-i18next`, `i18next-shopify`, `i18n-tag`, `flutter`, `vue-sfc`, `ember`, `chrome-ext`, `ruby-rails`, `custom`, `laravel`, `transloco`, `svelte`, `globalize`, `ui5`, `next-translate`, `php-gettext`, `general`, `lingui`, `jekyll`, `fluent-vue`, `fluent-vue-sfc`, `next-intl`, `next-international`

```jsonc
// Use only Vue and custom framework
{ "i18n-ally-next.enabledFrameworks": ["vue", "custom"] }
```

### `enabledParsers`

- **Type**: `string[]` — **Default**: — (auto-detected)

Manually specify which file parsers to enable.

**When to use:** Override auto-detection when you only use specific file formats, or to enable parsers for uncommon formats.

Available values: `js`, `ts`, `json`, `json5`, `yaml`, `ini`, `po`, `php`, `properties`, `ftl`

```jsonc
// Only parse JSON and YAML files
{ "i18n-ally-next.enabledParsers": ["json", "yaml"] }
```

### `parsers.extendFileExtensions`

- **Type**: `object` — **Default**: `{}`

Map custom file extensions to existing parsers.

**When to use:** When your locale files use non-standard extensions that the extension doesn't recognize.

```jsonc
{
  "i18n-ally-next.parsers.extendFileExtensions": {
    "json5": "json5",
    "yml": "yaml",
    "lang": "json"
  }
}
```

## Regex

### `regex.key`

- **Type**: `string` — **Default**: `"[\\w.-]+"`

Regex pattern for matching valid key characters.

**When to use:** Change when your keys contain characters not covered by the default pattern (word characters, dots, hyphens). For example, if keys contain `:` for namespaces or `/` for paths.

```jsonc
// Allow colons in keys (for namespace:key pattern)
{ "i18n-ally-next.regex.key": "[\\w.:-]+" }
```

### `regex.usageMatch`

- **Type**: `string[]` — **Default**: — (from framework)

Override **all** usage match patterns. Replaces the framework's built-in patterns entirely.

**When to use:** When you need complete control over how translation keys are detected in code. Use `{key}` as placeholder for the key pattern.

::: warning
This overrides all framework patterns. Use `regex.usageMatchAppend` instead if you only want to add extra patterns.
:::

```jsonc
{
  "i18n-ally-next.regex.usageMatch": [
    "\\Wt\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

### `regex.usageMatchAppend`

- **Type**: `string[]` — **Default**: `[]`

Append extra usage match patterns to the framework's built-in patterns.

**When to use:** When the framework's built-in patterns miss some translation function calls in your code. This is safer than `regex.usageMatch` because it doesn't replace existing patterns.

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\WcustomTranslate\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

## Extract

### `extract.autoDetect`

- **Type**: `boolean` — **Default**: `false`

Automatically detect hard-coded strings when opening a supported file.

**When to use:** Enable to get automatic highlighting of strings that should be extracted to i18n. Useful during initial i18n migration of a project.

### `extract.keygenStrategy`

- **Type**: `"slug" | "random" | "empty" | "source"` — **Default**: `"slug"`

Strategy for generating key names when extracting strings.

**When to use:**

- `slug` (default) — Generate a readable key from the string: `"Hello World"` → `hello_world`.
- `random` — Generate a random key: `"Hello World"` → `a3f2b1c4`.
- `empty` — Leave the key empty for manual input.
- `source` — Use the source string as the key: `"Hello World"` → `Hello World`.

```jsonc
{ "i18n-ally-next.extract.keygenStrategy": "slug" }
```

### `extract.keygenStyle`

- **Type**: `"default" | "kebab-case" | "snake_case" | "camelCase" | "PascalCase" | "ALL_CAPS"` — **Default**: `"default"`

Casing style for generated key names (only applies when `keygenStrategy` is `slug`).

**When to use:** Match your project's key naming convention.

```jsonc
// Generate keys like "hello-world" instead of "hello_world"
{ "i18n-ally-next.extract.keygenStyle": "kebab-case" }
```

### `extract.keyMaxLength`

- **Type**: `number` — **Default**: `Infinity`

Maximum length for generated keys.

**When to use:** Limit key length to keep locale files readable, especially when generating from long strings.

```jsonc
{ "i18n-ally-next.extract.keyMaxLength": 50 }
```

### `extract.keyPrefix`

- **Type**: `string` — **Default**: `""`

Prefix added to all generated keys.

**When to use:** Add a module or feature prefix to keep keys organized.

```jsonc
// All extracted keys will start with "settings."
{ "i18n-ally-next.extract.keyPrefix": "settings." }
```

### `extract.targetPickingStrategy`

- **Type**: `"none" | "auto" | "most-similar" | "most-similar-by-key" | "file-previous" | "global-previous"` — **Default**: `"none"`

How to automatically pick the target locale file when extracting.

**When to use:**

- `none` (default) — Always prompt the user to choose.
- `auto` — Automatically pick the most likely file.
- `most-similar` — Pick the file with the most similar existing translations.
- `most-similar-by-key` — Pick the file with the most similar key names.
- `file-previous` — Use the same file as the last extraction in this file.
- `global-previous` — Use the same file as the last extraction globally.

```jsonc
{ "i18n-ally-next.extract.targetPickingStrategy": "file-previous" }
```

### `extract.ignored`

- **Type**: `string[]` — **Default**: `[]`

Strings to ignore during hard-coded string detection.

**When to use:** Exclude common strings that should not be extracted (e.g. CSS class names, URLs, technical constants).

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

- **Type**: `object` — **Default**: `{}`

Per-file ignored strings during extraction. Keys are glob patterns, values are string arrays.

**When to use:** When certain strings should only be ignored in specific files.

```jsonc
{
  "i18n-ally-next.extract.ignoredByFiles": {
    "src/constants/**": ["DEBUG", "PRODUCTION"],
    "src/styles/**": ["flex", "grid", "block"]
  }
}
```

### `refactor.templates`

- **Type**: `object[]` — **Default**: `[]`

Custom refactor templates for string extraction, with fine-grained control over source context.

**When to use:** When you need different replacement templates depending on where the string is extracted from (HTML attribute, JS string, JSX text, etc.).

Each template object supports:

- `source` — Context type: `html-attribute`, `html-inline`, `js-string`, `js-template`, `jsx-text`
- `template` / `templates` — Replacement template(s), use `$1` for key
- `include` / `exclude` — Glob patterns to filter files

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

## Translation

### `translate.engines`

- **Type**: `string[]` — **Default**: `["google"]`

Translation engines to use for auto-translation.

**When to use:** Choose the translation service that best fits your needs. You can enable multiple engines and switch between them.

Available values: `google`, `google-cn`, `deepl`, `libretranslate`, `baidu`, `openai`, `ollama`, `editor-llm`

```jsonc
// Use DeepL as primary, Google as fallback
{ "i18n-ally-next.translate.engines": ["deepl", "google"] }
```

### `translate.parallels`

- **Type**: `number` — **Default**: `5`

Number of parallel translation requests.

**When to use:** Increase for faster batch translation, decrease if you hit API rate limits.

### `translate.promptSource`

- **Type**: `boolean` — **Default**: `false`

Prompt for confirmation before translating the source language.

**When to use:** Enable as a safety measure to prevent accidental overwrites of source translations.

### `translate.overrideExisting`

- **Type**: `boolean` — **Default**: `false`

Override existing translations when auto-translating.

**When to use:** Enable when you want to re-translate all keys, not just missing ones. Use with caution — this will overwrite manually edited translations.

### `translate.saveAsCandidates`

- **Type**: `boolean` — **Default**: `false`

Save auto-translated text as review candidates instead of final translations.

**When to use:** Enable when you want human review of machine translations before they go live. Works with the review system.

### `translate.fallbackToKey`

- **Type**: `boolean` — **Default**: `false`

Use the key name as fallback text when no translation exists.

**When to use:** Useful during development when keys are descriptive enough to serve as placeholder text.

### Translation Engine Configuration

#### Google Translate

```jsonc
{
  "i18n-ally-next.translate.engines": ["google"],
  "i18n-ally-next.translate.google.apiKey": "YOUR_API_KEY"
}
```

- `translate.google.apiKey` — Google Cloud Translation API key. Without a key, the free (unofficial) API is used, which may have rate limits.

#### Google Translate (China)

```jsonc
{ "i18n-ally-next.translate.engines": ["google-cn"] }
```

Uses `translate.google.cn` endpoint. No API key required. Best for users in mainland China.

#### DeepL

```jsonc
{
  "i18n-ally-next.translate.engines": ["deepl"],
  "i18n-ally-next.translate.deepl.apiKey": "YOUR_API_KEY",
  "i18n-ally-next.translate.deepl.useFreeApiEntry": true
}
```

- `translate.deepl.apiKey` — DeepL API authentication key (required).
- `translate.deepl.useFreeApiEntry` — Set to `true` if using the DeepL Free plan.
- `translate.deepl.enableLog` — Enable debug logging for DeepL requests.

#### Baidu Translate

```jsonc
{
  "i18n-ally-next.translate.engines": ["baidu"],
  "i18n-ally-next.translate.baidu.appid": "YOUR_APP_ID",
  "i18n-ally-next.translate.baidu.apiSecret": "YOUR_API_SECRET"
}
```

- `translate.baidu.appid` — Baidu Translate App ID.
- `translate.baidu.apiSecret` — Baidu Translate API Secret.

#### LibreTranslate

```jsonc
{
  "i18n-ally-next.translate.engines": ["libretranslate"],
  "i18n-ally-next.translate.libre.apiRoot": "http://localhost:5000"
}
```

- `translate.libre.apiRoot` — LibreTranslate server URL. Default is `http://localhost:5000` for self-hosted instances.

#### OpenAI

```jsonc
{
  "i18n-ally-next.translate.engines": ["openai"],
  "i18n-ally-next.translate.openai.apiKey": "YOUR_API_KEY",
  "i18n-ally-next.translate.openai.apiRoot": "https://api.openai.com",
  "i18n-ally-next.translate.openai.apiModel": "gpt-3.5-turbo"
}
```

- `translate.openai.apiKey` — OpenAI API key (required).
- `translate.openai.apiRoot` — API endpoint. Change for Azure OpenAI or compatible APIs.
- `translate.openai.apiModel` — Model to use.

#### Ollama

```jsonc
{
  "i18n-ally-next.translate.engines": ["ollama"],
  "i18n-ally-next.translate.ollama.apiRoot": "http://localhost:11434",
  "i18n-ally-next.translate.ollama.model": "qwen2.5:latest"
}
```

- `translate.ollama.apiRoot` — Ollama server URL. Default is `http://localhost:11434`.
- `translate.ollama.model` — Model name. Must be pulled locally first via `ollama pull`.

#### Editor LLM (VS Code Built-in)

```jsonc
{
  "i18n-ally-next.translate.engines": ["editor-llm"],
  "i18n-ally-next.translate.editor-llm.model": ""
}
```

- `translate.editor-llm.model` — Preferred language model ID. Leave empty to auto-select from available VS Code language models.

## Review

### `review.enabled`

- **Type**: `boolean` — **Default**: `true`

Enable the translation review system.

**When to use:** The review system allows team members to approve, reject, or comment on translations. Disable if you don't need review workflows.

### `review.gutters`

- **Type**: `boolean` — **Default**: `true`

Show review status icons in the editor gutter.

**When to use:** Disable if gutter icons are too noisy alongside other extensions.

### `review.user.name`

- **Type**: `string` — **Default**: — (from `git config user.name`)

Reviewer name for review comments.

**When to use:** Override when your git config name doesn't match your preferred reviewer identity.

### `review.user.email`

- **Type**: `string` — **Default**: — (from `git config user.email`)

Reviewer email for review comments.

### `review.removeCommentOnResolved`

- **Type**: `boolean` — **Default**: `false`

Remove review comments when they are resolved.

**When to use:** Enable to keep review files clean. When disabled, resolved comments remain in the file with a "resolved" status.

## File Writing

### `indent`

- **Type**: `number` — **Default**: `2`

Indentation size (number of spaces or tabs) when writing locale files.

**When to use:** Match your project's code style. Common values: `2` or `4`.

### `tabStyle`

- **Type**: `"space" | "tab"` — **Default**: `"space"`

Use spaces or tabs for indentation in locale files.

### `sortKeys`

- **Type**: `boolean` — **Default**: `false`

Sort keys alphabetically when writing locale files.

**When to use:** Enable to maintain consistent key ordering across locale files, making diffs cleaner and reducing merge conflicts.

```jsonc
{ "i18n-ally-next.sortKeys": true }
```

### `sortCompare`

- **Type**: `"binary" | "locale"` — **Default**: `"binary"`

Comparison method for sorting keys.

**When to use:**

- `binary` (default) — Simple byte-by-byte comparison. Fast and deterministic.
- `locale` — Locale-aware comparison using `Intl.Collator`. Better for non-ASCII keys.

### `sortLocale`

- **Type**: `string` — **Default**: —

Locale to use for locale-aware sorting (only applies when `sortCompare` is `"locale"`).

```jsonc
{
  "i18n-ally-next.sortCompare": "locale",
  "i18n-ally-next.sortLocale": "zh-CN"
}
```

### `keepFulfilled`

- **Type**: `boolean` — **Default**: `false`

Keep fully translated keys in the "pending" list.

**When to use:** Enable when you want to review all keys, not just missing ones.

## Usage Analysis

### `keysInUse`

- **Type**: `string[]` — **Default**: `[]`

Keys manually marked as "in use". These keys won't be reported as unused even if no code reference is found.

**When to use:** Mark keys that are used dynamically (e.g. computed keys, keys from API responses) and can't be detected by static analysis.

```jsonc
{
  "i18n-ally-next.keysInUse": [
    "errors.*",
    "dynamic.key.prefix.*"
  ]
}
```

### `usage.derivedKeyRules`

- **Type**: `string[]` — **Default**: —

Rules for derived keys like plurals or context variants.

**When to use:** When your i18n library generates derived keys (e.g. `key_one`, `key_other` for plurals) that should be considered "in use" if the base key is used.

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

- **Type**: `string[]` — **Default**: `[]`

Glob patterns for files to ignore when scanning for key usage.

**When to use:** Exclude generated files, build output, or test fixtures from usage scanning.

```jsonc
{
  "i18n-ally-next.usage.scanningIgnore": [
    "dist/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

## Other

### `preferredDelimiter`

- **Type**: `string` — **Default**: `"-"`

Preferred delimiter for locale codes when normalizing.

**When to use:** Controls how locale codes are formatted. For example, `zh_CN` vs `zh-CN`. The default `-` produces BCP47-style codes.

### `fullReloadOnChanged`

- **Type**: `boolean` — **Default**: `false`

Trigger a full reload of all locale files when any file changes.

**When to use:** Enable if you experience stale data after editing locale files. This is slower but more reliable. Usually not needed.

### `includeSubfolders`

- **Type**: `boolean` — **Default**: `true`

Include subfolders when scanning for locale files.

**When to use:** Disable if you have deeply nested directories and only want to scan the top-level locale directory.

### `ignoreFiles`

- **Type**: `string[]` — **Default**: `[]`

Glob patterns for locale files to ignore.

**When to use:** Exclude specific locale files from being loaded, such as generated files or backup files.

```jsonc
{
  "i18n-ally-next.ignoreFiles": [
    "**/*.backup.json",
    "**/generated/**"
  ]
}
```

### `editor.preferEditor`

- **Type**: `boolean` — **Default**: `false`

Prefer the built-in editor UI over VS Code's quick input for editing translations.

**When to use:** Enable if you prefer a richer editing experience with the extension's custom editor panel instead of the inline quick input dialog.
