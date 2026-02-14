# Core Architecture & Module Guide

## Overall Architecture

```text
Translation files (.json/.yaml/...)
    ↓ Parser parses
LocaleLoader loads
    ↓ updateLocalesTree()
LocaleTree / LocaleNode (in-memory translation tree)
    ↓ getTreeNodeByKey() / getValueByKey()
Editor features (annotation / definition / hover / completion)
    ↑ KeyDetector detects keys in source code
Source code files (.ts/.vue/.jsx/...)
```

## Core Modules

### Config (`src/core/Config.ts`)

Reads user configuration from `.vscode/settings.json`. Key items:

- `keystyle` — `nested` or `flat`
- `namespace` — Whether namespace is enabled
- `defaultNamespace` — Default namespace
- `namespaceDelimiter` — Namespace delimiter (defined by framework, e.g., `:`)
- `pathMatcher` — Translation file path pattern (e.g., `{locale}/{namespace}.json`)
- `disablePathParsing` — Treat entire key as a whole

### Global (`src/core/Global.ts`)

Global state management: framework detection, loader creation, provides `getNamespaceDelimiter()`, `getUsageMatchRegex()`, listens to config changes.

### KeyDetector (`src/core/KeyDetector.ts`)

Detects i18n keys from source code:

- **`getKey(document, position)`** — Key at cursor position (without namespace prefix)
- **`getKeys(document)`** — All keys in document (with namespace prefix, processed through `handleRegexMatch` + `rewriteKeys`)

::: warning
`getKey()` returns keys without namespace prefix, `getKeys()` returns keys with namespace prefix. Use `getKeys()` in scenarios requiring the full key (e.g., `definition.ts`).
:::

### Loader System (`src/core/loaders/`)

- **`Loader`** (base class) — `updateTree()`, `getTreeNodeByKey()`, `getNodeByKey()`, `getFilepathByKey()`
- **`LocaleLoader`** (main loader) — `updateLocalesTree()` builds translation tree; when namespace enabled, manually creates namespace subtrees with `namespaceDelimiter`
- **`ComposedLoader`** — Aggregates multiple loaders, returns first found result

### Framework System (`src/frameworks/`)

Each framework extends `Framework` base class:

- `usageMatchRegex` — Regex for matching key calls in source code
- `namespaceDelimiter` — Namespace delimiter
- `rewriteKeys(key, source, context)` — Key rewriting logic
- `getScopeRange(document)` — Scope ranges (e.g., `useTranslation("ns")`)
- `enableFeatures` — Enabled features (e.g., `namespace: true`)
- `detection` — Framework detection rules (via package.json dependencies)

### Parser System (`src/parsers/`)

Each parser extends the base class:

- **`navigateToKey(text, keypath, keystyle)`** — Locates key position in translation file (for Go to Definition)
- **`parse(text)`** — Parses translation file content into key-value pairs

### Editor Features (`src/editor/`)

| Module | Feature | Key Logic |
| --- | --- | --- |
| `annotation.ts` | Inline translation display | `KeyDetector.getUsages()` → `loader.getValueByKey()` |
| `definition.ts` | Go to Definition | `KeyDetector.getKeys()` → `loader.getFilepathByKey()` → `parser.navigateToKey()` |
| `hover.ts` | Hover tooltips | Displays all language translations |
| `completion.ts` | Auto-completion | Key completion suggestions |
| `extract.ts` | String extraction | CodeAction for extracting hard-coded strings |

### Utils (`src/utils/`)

| Module | Function |
| --- | --- |
| `NodeHelper.ts` | `splitKeypath()`, `getPathWithoutNamespace()` |
| `Regex.ts` | `handleRegexMatch()`, `regexFindKeys()` |
| `PathMatcher.ts` | File path matching, locale/namespace extraction |
| `flat.ts` | Object flatten / unflatten |

## Data Flow

### Translation File Loading

```text
File system watcher → LocaleLoader.loadFile()
    → Parser.parse()
    → updateLocalesTree()
        → If namespace enabled: create namespace subtree with delimiter
        → Loader.updateTree() recursively builds subtree
    → Trigger UI updates
```

### Key Detection & Parsing

```text
Source code → KeyDetector.getKeys()
    → regexFindKeys() with framework regex
        → handleRegexMatch()
            → Check explicit namespace (key contains delimiter)
            → Auto-concatenate if defaultNamespace/scope exists
            → framework.rewriteKeys()
    → Returns KeyInDocument[]
```

### Go to Definition

```text
User Ctrl+Click → DefinitionProvider.provideDefinition()
    → KeyDetector.getKeys() (with namespace)
    → loader.getFilepathByKey(key)
    → NodeHelper.getPathWithoutNamespace(key)
    → parser.navigateToKey(text, keypath)
    → Returns Location
```
