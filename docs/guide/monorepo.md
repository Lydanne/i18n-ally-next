# Monorepo

## Workspace-level Configuration

In a monorepo, each package can have its own `.vscode/settings.json`. However, if you open the monorepo root in VS Code, you need to configure i18n Ally Next to find locale files across packages.

### Option 1: Multiple Locale Paths

Point to all packages' locale directories:

```jsonc
// .vscode/settings.json (monorepo root)
{
  "i18n-ally-next.localesPaths": [
    "packages/web/src/locales",
    "packages/admin/src/locales",
    "packages/shared/locales"
  ]
}
```

### Option 2: Glob Pattern with Path Matcher

Use a glob-based path matcher to auto-discover locale files:

```jsonc
{
  "i18n-ally-next.localesPaths": ["packages"],
  "i18n-ally-next.pathMatcher": "{namespace}/{locale}.json"
}
```

## Shared Translations

For translations shared across packages, create a dedicated shared package:

```text
packages/
├── shared/
│   └── locales/
│       ├── en/
│       │   └── common.json
│       └── zh-CN/
│           └── common.json
├── web/
│   └── src/
│       └── locales/
│           ├── en/
│           │   └── web.json
│           └── zh-CN/
│               └── web.json
└── admin/
    └── src/
        └── locales/
            ├── en/
            │   └── admin.json
            └── zh-CN/
                └── admin.json
```

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": [
    "packages/shared/locales",
    "packages/web/src/locales",
    "packages/admin/src/locales"
  ],
  "i18n-ally-next.dirStructure": "dir",
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json"
}
```

## VS Code Multi-root Workspace

For better isolation, use a [multi-root workspace](https://code.visualstudio.com/docs/editor/multi-root-workspaces). Each workspace folder gets its own i18n Ally Next configuration:

```jsonc
// monorepo.code-workspace
{
  "folders": [
    { "path": "packages/web" },
    { "path": "packages/admin" },
    { "path": "packages/shared" }
  ]
}
```

Each package has its own `.vscode/settings.json`:

```jsonc
// packages/web/.vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

This approach provides the best experience because:

- Each package has **independent framework detection**
- **No cross-package key conflicts**
- **Faster scanning** — only scans relevant locale files

## Namespace Per Package

A common pattern is to use the package name as the namespace:

```text
locales/
├── en/
│   ├── web.json       # namespace: web
│   ├── admin.json     # namespace: admin
│   └── common.json    # namespace: common (shared)
└── zh-CN/
    ├── web.json
    ├── admin.json
    └── common.json
```

```jsonc
{
  "i18n-ally-next.localesPaths": ["locales"],
  "i18n-ally-next.dirStructure": "dir",
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json",
  "i18n-ally-next.defaultNamespace": "common"
}
```

In code:

```tsx
// packages/web — uses web namespace
t('web:dashboard.title')

// packages/admin — uses admin namespace
t('admin:users.list')

// shared — uses default namespace
t('ok')  // → common:ok
```
