# 文案提取

i18n Ally Next 可以检测代码中的硬编码字符串，并帮助你将它们提取到语言文件中。

## 自动检测

启用自动检测以实时高亮硬编码字符串：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.extract.autoDetect": true
}
```

硬编码字符串会显示在侧边栏的 **Hard-coded Strings** 部分。

## 提取单个字符串

1. 将光标放在硬编码字符串上
2. 点击灯泡图标或使用 `Cmd+.`（macOS）/ `Ctrl+.`（Windows/Linux）
3. 选择 **Extract to i18n**
4. 输入键名
5. 选择目标语言文件

## 批量提取

在资源管理器中右键点击文件，选择 **Extract all hard-coded strings (experimental)** 即可批量提取。

## 键生成策略

控制键名的自动生成方式：

```jsonc
{
  // "slug"（默认）— 生成 slug 风格的键名: "hello-world"
  // "random" — 生成随机键名
  // "empty" — 留空键名，手动输入
  // "source" — 使用源字符串作为键名
  // "template" — 通过模板字符串生成键名（见下方）
  "i18n-ally-next.extract.keygenStrategy": "slug",

  // 键名风格: "default", "camelCase", "PascalCase", "snake_case", "kebab-case"
  "i18n-ally-next.extract.keygenStyle": "default",

  // 键名最大长度
  "i18n-ally-next.extract.keyMaxLength": 50,

  // 键名前缀
  "i18n-ally-next.extract.keyPrefix": ""
}
```

### 模板模式

当 `keygenStrategy` 设置为 `"template"` 时，键名将根据自定义模板字符串和变量占位符生成：

```jsonc
{
  "i18n-ally-next.extract.keygenStrategy": "template",
  "i18n-ally-next.extract.keygenTemplate": "{{dirname}}:{{filename}}"
}
```

#### 可用变量

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `{{dirname}}` | 当前文件所在目录名 | `setup` |
| `{{filename}}` | 当前文件名（不含扩展名） | `setup.command` |
| `{{package.name}}` | 最近的 `package.json` 的 `name` 字段 | `@spaceflow/cli` |
| `{{package_dirname}}` | 最近的 `package.json` 所在目录名 | `cli` |

#### 示例

对于文件 `src/commands/setup/setup.command.ts`，使用模板 `{{dirname}}:{{filename}}`：

- `{{dirname}}` → `setup`
- `{{filename}}` → `setup.command`
- 生成的键名前缀：`setup:setup.command`

最终键名为 `setup:setup.command` + 你在输入框中输入的文本。

::: tip
模板模式非常适合启用了命名空间的项目。例如 `{{dirname}}:` 可以自动生成映射到正确命名空间文件的键名。
:::

## 目标文件选择策略

当存在多个语言文件时，控制目标文件的选择方式：

```jsonc
{
  // "none" — 每次都提示选择
  // "auto" — 根据源语言文件结构自动推断目标文件（支持 namespace）
  // "most-similar" — 选择与当前文件路径最相似的文件
  // "most-similar-by-key" — 按键前缀匹配
  // "file-previous" — 记住每个文件的上次选择
  // "global-previous" — 全局记住上次选择
  "i18n-ally-next.extract.targetPickingStrategy": "none"
}
```

## 忽略特定字符串

排除特定字符串不被检测：

```jsonc
{
  "i18n-ally-next.extract.ignored": [
    "TODO",
    "FIXME"
  ],
  "i18n-ally-next.extract.ignoredByFiles": {
    "src/constants.ts": ["SOME_CONSTANT"]
  }
}
```

## 重构模板

自定义提取后替换的代码模板：

```jsonc
{
  "i18n-ally-next.refactor.templates": [
    {
      "source": "js-string",
      "templates": ["t('{key}')"]
    },
    {
      "source": "jsx-text",
      "templates": ["{t('{key}')}"]
    }
  ]
}
```

可用的 source 类型：`html-attribute`、`html-inline`、`js-string`、`js-template`、`jsx-text`。

## 全项目扫描与提取

除了单文件和批量提取，i18n Ally Next 还支持**扫描整个项目**的硬编码字符串并一次性全部提取。

### 运行扫描

运行命令面板中的 `i18n Ally Next: Scan and Extract All`。

处理流程：

1. 扫描项目中所有支持的文件（遵循 `.gitignore`）
2. 检测每个文件中的硬编码字符串
3. 显示摘要：发现 **N 个文件**中有 **M 个硬编码字符串**
4. 确认后自动提取所有字符串——生成键名并写入 locale 文件

### 扫描配置

控制哪些文件被纳入或排除在扫描范围之外：

```jsonc
{
  // 扫描包含的文件 glob 模式
  // 如果为空，使用默认的支持语言 glob
  "i18n-ally-next.extract.scanningInclude": [
    "src/**/*.{ts,tsx,vue,js,jsx}"
  ],

  // 扫描时忽略的文件 glob 模式
  "i18n-ally-next.extract.scanningIgnore": [
    "src/generated/**",
    "src/**/*.test.*",
    "src/**/*.spec.*"
  ]
}
```

::: tip
对于大型项目，通过 `scanningInclude` 缩小扫描范围，避免扫描无关文件，加快处理速度。
:::
