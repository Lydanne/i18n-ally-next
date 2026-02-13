# Monorepo

## 工作区级别配置

在 monorepo 中，每个包可以有自己的 `.vscode/settings.json`。但如果你在 VS Code 中打开 monorepo 根目录，需要配置 i18n Ally Next 以跨包查找语言文件。

### 方案一：多个语言文件路径

指向所有包的语言文件目录：

```jsonc
// .vscode/settings.json（monorepo 根目录）
{
  "i18n-ally-next.localesPaths": [
    "packages/web/src/locales",
    "packages/admin/src/locales",
    "packages/shared/locales"
  ]
}
```

### 方案二：使用路径匹配器的 Glob 模式

使用基于 glob 的路径匹配器自动发现语言文件：

```jsonc
{
  "i18n-ally-next.localesPaths": ["packages"],
  "i18n-ally-next.pathMatcher": "{namespace}/{locale}.json"
}
```

## 共享翻译

对于跨包共享的翻译，创建一个专用的共享包：

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

## VS Code 多根工作区

为了更好的隔离性，使用[多根工作区](https://code.visualstudio.com/docs/editor/multi-root-workspaces)。每个工作区文件夹拥有独立的 i18n Ally Next 配置：

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

每个包有自己的 `.vscode/settings.json`：

```jsonc
// packages/web/.vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

这种方式体验最佳，因为：

- 每个包有**独立的框架检测**
- **无跨包 key 冲突**
- **更快的扫描速度**——只扫描相关的语言文件

## 按包划分命名空间

常见模式是使用包名作为命名空间：

```text
locales/
├── en/
│   ├── web.json       # 命名空间: web
│   ├── admin.json     # 命名空间: admin
│   └── common.json    # 命名空间: common（共享）
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

在代码中：

```tsx
// packages/web — 使用 web 命名空间
t('web:dashboard.title')

// packages/admin — 使用 admin 命名空间
t('admin:users.list')

// 共享 — 使用默认命名空间
t('ok')  // → common:ok
```
