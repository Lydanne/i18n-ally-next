# 核心架构与模块说明

## 整体架构

```text
翻译文件 (.json/.yaml/...)
    ↓ Parser 解析
LocaleLoader 加载
    ↓ updateLocalesTree()
LocaleTree / LocaleNode（内存中的翻译树）
    ↓ getTreeNodeByKey() / getValueByKey()
编辑器功能（annotation / definition / hover / completion）
    ↑ KeyDetector 检测源码中的 key
源代码文件 (.ts/.vue/.jsx/...)
```

## 核心模块

### Config（`src/core/Config.ts`）

读取用户在 `.vscode/settings.json` 中的配置项。关键配置：

- `keystyle` — key 风格，`nested`（嵌套）或 `flat`（扁平）
- `namespace` — 是否启用 namespace
- `defaultNamespace` — 默认 namespace
- `namespaceDelimiter` — namespace 分隔符（由框架定义，如 `:`）
- `pathMatcher` — 翻译文件路径匹配模式（如 `{locale}/{namespace}.json`）
- `disablePathParsing` — 是否禁用路径解析

### Global（`src/core/Global.ts`）

全局状态管理：框架检测与初始化、Loader 创建、提供 `getNamespaceDelimiter()`、`getUsageMatchRegex()` 等方法、监听配置变化。

### KeyDetector（`src/core/KeyDetector.ts`）

从源代码中检测 i18n key：

- **`getKey(document, position)`** — 获取光标位置的 key（不含 namespace 前缀）
- **`getKeys(document)`** — 获取文档中所有 key（经过 `handleRegexMatch` + `rewriteKeys` 处理，包含 namespace 前缀）

::: warning
`getKey()` 返回的 key 不含 namespace 前缀，`getKeys()` 返回的 key 包含 namespace 前缀。在需要完整 key 的场景（如 `definition.ts`）应使用 `getKeys()`。
:::

### Loader 体系（`src/core/loaders/`）

- **`Loader`**（基类）— `updateTree()`、`getTreeNodeByKey()`、`getNodeByKey()`、`getFilepathByKey()`
- **`LocaleLoader`**（主加载器）— `updateLocalesTree()` 构建翻译树；namespace 启用时手动创建 namespace 子树，用 `namespaceDelimiter` 拼接 keypath
- **`ComposedLoader`** — 聚合多个 loader，查找时遍历所有 loader 返回第一个找到的结果

### Framework 体系（`src/frameworks/`）

每个框架继承 `Framework` 基类：

- `usageMatchRegex` — 源码中 key 的匹配正则
- `namespaceDelimiter` — namespace 分隔符
- `rewriteKeys(key, source, context)` — key 重写逻辑
- `getScopeRange(document)` — 获取 scope 范围（如 `useTranslation("ns")`）
- `enableFeatures` — 启用的功能（如 `namespace: true`）
- `detection` — 框架检测规则（通过 package.json 依赖检测）

### Parser 体系（`src/parsers/`）

每个 Parser 继承基类：

- **`navigateToKey(text, keypath, keystyle)`** — 在翻译文件中定位 key 的位置（用于 Go to Definition）
- **`parse(text)`** — 解析翻译文件内容为键值对

### Editor 功能（`src/editor/`）

| 模块 | 功能 | 关键逻辑 |
| --- | --- | --- |
| `annotation.ts` | 内联翻译显示 | `KeyDetector.getUsages()` → `loader.getValueByKey()` |
| `definition.ts` | Go to Definition | `KeyDetector.getKeys()` → `loader.getFilepathByKey()` → `parser.navigateToKey()` |
| `hover.ts` | 悬停提示 | 显示所有语言的翻译值 |
| `completion.ts` | 自动补全 | 提供 key 补全建议 |
| `extract.ts` | 字符串提取 | 提供 CodeAction，将硬编码字符串提取为 i18n key |

### Utils（`src/utils/`）

| 模块 | 功能 |
| --- | --- |
| `NodeHelper.ts` | `splitKeypath()`、`getPathWithoutNamespace()` |
| `Regex.ts` | `handleRegexMatch()`、`regexFindKeys()` |
| `PathMatcher.ts` | 翻译文件路径匹配，提取 locale 和 namespace |
| `flat.ts` | 对象扁平化 / 反扁平化 |

## 数据流

### 翻译文件加载

```text
文件系统监听 → LocaleLoader.loadFile()
    → Parser.parse()
    → updateLocalesTree()
        → 如果启用 namespace：创建 namespace 子树，用 delimiter 拼接 keypath
        → Loader.updateTree() 递归构建子树
    → 触发 UI 更新
```

### Key 检测与解析

```text
源代码 → KeyDetector.getKeys()
    → regexFindKeys() 使用框架正则匹配
        → handleRegexMatch()
            → 检测是否有显式 namespace（key 中包含 delimiter）
            → 如果没有显式 namespace 且有 defaultNamespace/scope，自动拼接
            → framework.rewriteKeys()
    → 返回 KeyInDocument[]
```

### Go to Definition

```text
用户 Ctrl+Click → DefinitionProvider.provideDefinition()
    → KeyDetector.getKeys()（带 namespace）
    → loader.getFilepathByKey(key)
    → NodeHelper.getPathWithoutNamespace(key)
    → parser.navigateToKey(text, keypath)
    → 返回 Location
```
