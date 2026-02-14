# Project Overview & Directory Structure

## Introduction

i18n Ally Next is a VS Code extension for internationalization (i18n) workflow assistance. It supports multiple i18n frameworks (e.g., i18next, vue-i18n, react-intl, etc.), providing inline translation display, go-to-definition, auto-completion, hard-coded string extraction, translation management, and more.

## Tech Stack

- **Language**: TypeScript
- **Build**: Webpack (main extension) + Vite (Webview editor)
- **Testing**: ts-mocha + chai (unit tests), @vscode/test-electron (e2e / fixture tests)
- **Package Manager**: pnpm (workspace mode)
- **Code Style**: ESLint

## Directory Structure

```text
i18n-ally-next/
├── src/                        # Source code
│   ├── extension.ts            # Plugin entry, registers all modules
│   ├── core/                   # Core modules
│   │   ├── Config.ts           # User configuration reading & management
│   │   ├── Global.ts           # Global state management
│   │   ├── CurrentFile.ts      # Current active file state
│   │   ├── KeyDetector.ts      # Detect i18n keys from source code
│   │   ├── Nodes.ts            # LocaleTree / LocaleNode data structures
│   │   ├── types.ts            # Core type definitions
│   │   ├── Analyst.ts          # Translation coverage analysis
│   │   ├── Review.ts           # Translation review feature
│   │   ├── Translator.ts       # Machine translation integration
│   │   ├── Extract.ts          # String extraction core logic
│   │   └── loaders/            # Translation file loaders
│   │       ├── Loader.ts       # Loader base class (tree building, key lookup)
│   │       ├── LocaleLoader.ts # Main loader (file parsing, tree update)
│   │       ├── ComposedLoader.ts # Composed loader (aggregates multiple loaders)
│   │       ├── VueSfcLoader.ts # Vue SFC loader
│   │       └── FluentVueSfcLoader.ts # Fluent Vue SFC loader
│   │
│   ├── editor/                 # Editor features
│   │   ├── annotation.ts       # Inline translation display
│   │   ├── definition.ts       # Go to Definition
│   │   ├── hover.ts            # Hover tooltips
│   │   ├── completion.ts       # Auto-completion
│   │   ├── reference.ts        # Find References
│   │   ├── refactor.ts         # Refactoring (rename key, etc.)
│   │   ├── extract.ts          # String extraction CodeAction
│   │   ├── problems.ts         # Problem diagnostics
│   │   ├── reviewComments.ts   # Translation review comments
│   │   └── statusbar.ts        # Status bar display
│   │
│   ├── frameworks/             # Framework adapters (30+)
│   │   ├── base.ts             # Framework base class
│   │   ├── custom.ts           # Custom framework (user-configured via YAML)
│   │   ├── i18next.ts          # i18next framework
│   │   ├── react-i18next.ts    # react-i18next framework
│   │   ├── vue.ts              # vue-i18n framework
│   │   └── index.ts            # Framework registration & detection
│   │
│   ├── parsers/                # Translation file parsers
│   │   ├── base.ts             # Parser base class (navigateToKey, etc.)
│   │   ├── json.ts / yaml.ts   # JSON / YAML parsers
│   │   └── ecmascript.ts       # JS/TS parser
│   │
│   ├── utils/                  # Utility functions
│   │   ├── NodeHelper.ts       # Key path handling
│   │   ├── Regex.ts            # Regex matching
│   │   ├── PathMatcher.ts      # File path matching
│   │   └── flat.ts             # Object flatten / unflatten
│   │
│   ├── commands/               # VS Code commands
│   ├── views/                  # TreeView sidebar
│   ├── translators/            # Translation engine integrations
│   ├── extraction/             # Hard-coded string detection
│   ├── webview/                # Webview editor (Vite build)
│   └── meta.ts                 # Constants (KEY_REG, etc.)
│
├── test/                       # Tests
│   ├── unit/                   # Unit tests (ts-mocha)
│   ├── e2e/                    # E2E tests (VS Code extension host)
│   ├── fixtures/               # Fixture test cases (string extraction)
│   └── fixture-scripts/        # Fixture test runner
│
├── locales/                    # Plugin's own i18n translation files
├── scripts/                    # Build scripts
├── examples/                   # Example projects (also used as e2e fixtures)
├── res/                        # Static resources (icons, Webview HTML, etc.)
├── docs/                       # Documentation site (VitePress)
├── package.json                # Plugin manifest + dependencies + configuration
├── webpack.config.js           # Main extension Webpack config
└── tsconfig.json               # TypeScript config
```

## Key Configuration Files

| File | Description |
| --- | --- |
| `package.json` | Plugin manifest, defines all VS Code configuration items (`contributes.configuration`), commands, menus, etc. |
| `webpack.config.js` | Main extension bundling config, outputs `extension.js` |
| `src/webview/vite.config.ts` | Webview editor Vite build config |
| `tsconfig.json` | Main TypeScript config, uses `~` path alias pointing to `src/` |
| `package.nls.*.json` | Plugin UI multi-language translation files |
