# 自定义框架

如果你的 i18n 方案不在内置支持列表中，可以通过 YAML 配置文件定义自定义框架。

## 配置文件

在项目根目录创建 `.vscode/i18n-ally-next-custom-framework.yml`：

```yaml
# 启用注解的语言 ID
languageIds:
  - typescript
  - typescriptreact
  - javascript
  - javascriptreact

# 检测代码中 i18n 键的正则表达式
# 使用 {key} 作为键的占位符
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
  - "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"

# 提取文案时的重构模板
# 使用 $1 作为键的占位符
refactorTemplates:
  - "t('$1')"
  - "{t('$1')}"

# 启用命名空间支持
namespace: true

# 命名空间分隔符（默认: "."）
namespaceDelimiter: ":"

# 检测作用域范围的正则表达式
# 第一个捕获组为命名空间名称
scopeRangeRegex: "useTranslation\\(['\"](.+?)['\"]\\)"

# 设为 true 时禁用所有其他框架
monopoly: false
```

## 配置项参考

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `languageIds` | `string \| string[]` | VS Code 语言 ID，用于启用注解 |
| `usageMatchRegex` | `string \| string[]` | 检测 i18n 键的正则表达式，使用 `{key}` 占位符 |
| `refactorTemplates` | `string[]` | 文案提取的重构模板，使用 `$1` 代替键 |
| `namespace` | `boolean` | 启用命名空间支持 |
| `namespaceDelimiter` | `string` | 命名空间与键之间的分隔符（如 `:`、`.`） |
| `scopeRangeRegex` | `string` | 检测命名空间作用域范围的正则表达式 |
| `monopoly` | `boolean` | 设为 `true` 时禁用所有其他框架 |

## 示例

### 简单的 `t()` 函数

```yaml
languageIds:
  - typescript
  - javascript
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
refactorTemplates:
  - "t('$1')"
```

### 带 `:` 分隔符的命名空间

```yaml
languageIds:
  - typescript
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
```

这样 `t("review:description")` 会被解析为命名空间 `review`，键 `description`。

### 自定义作用域检测

```yaml
languageIds:
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
scopeRangeRegex: "useMessages\\(['\"](.+?)['\"]\\)"
refactorTemplates:
  - "{t('$1')}"
```

使用此配置后，以下代码会自动限定键的作用域：

```tsx
const t = useMessages("settings")
// t("title") → 解析为 "settings.title"
```

## 启用自定义框架

两种方式：

1. **自动检测** — 只需创建 YAML 文件，插件会自动检测
2. **手动指定** — 在启用的框架列表中添加 `"custom"`：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["custom"]
}
```

## 热重载

自定义框架配置支持热重载。修改 YAML 文件后，插件会自动重新加载。
