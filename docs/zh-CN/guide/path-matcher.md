# 路径匹配

路径匹配定义了如何发现语言文件，以及如何从文件路径中提取语言和命名空间信息。

## 默认模式

默认模式取决于你的目录结构：

| 目录结构 | 命名空间 | 模式 |
| --- | --- | --- |
| `file` | — | `{locale}.{ext}` |
| `dir` | 禁用 | `{locale}/**/*.{ext}` |
| `dir` | 启用 | `{locale}/**/{namespace}.{ext}` |

## 占位符

| 占位符 | 说明 |
| --- | --- |
| `{locale}` | 语言代码（如 `en`、`zh-CN`） |
| `{namespace}` | 从文件名提取的命名空间名称 |
| `{ext}` | 文件扩展名（根据启用的解析器自动解析） |
| `*` / `**` | Glob 通配符 |

## 自定义路径匹配

覆盖默认模式：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

## 示例

### 扁平文件

```text
locales/en.json
locales/zh-CN.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{locale}.{ext}" }
```

### 按语言嵌套

```text
locales/en/common.json
locales/en/review.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{locale}/{namespace}.{ext}" }
```

### 按命名空间嵌套

```text
locales/common/en.json
locales/common/zh-CN.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{namespace}/{locale}.{ext}" }
```

### 深层嵌套

```text
src/modules/auth/i18n/en.json
src/modules/dashboard/i18n/en.json
```

```jsonc
{ "i18n-ally-next.pathMatcher": "{namespace}/i18n/{locale}.{ext}" }
```
