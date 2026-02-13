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
  "i18n-ally-next.extract.keygenStrategy": "slug",

  // 键名风格: "default", "camelCase", "PascalCase", "snake_case", "kebab-case"
  "i18n-ally-next.extract.keygenStyle": "default",

  // 键名最大长度
  "i18n-ally-next.extract.keyMaxLength": 50,

  // 键名前缀
  "i18n-ally-next.extract.keyPrefix": ""
}
```

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
