# 正则匹配

自定义 i18n Ally Next 如何在源代码中检测 i18n 键。

## 工作原理

插件使用正则表达式在代码中查找 `t("key")` 等 i18n 函数调用。每个框架提供默认的匹配模式，你也可以覆盖或扩展。

## 覆盖所有模式

替换所有框架提供的匹配模式：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.regex.usageMatch": [
    "\\Wt\\(\\s*['\"`]({key})['\"`]",
    "\\Wi18n\\.t\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

## 追加模式

在默认模式基础上追加额外的匹配模式：

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\WformatMessage\\(\\s*\\{\\s*id:\\s*['\"`]({key})['\"`]"
  ]
}
```

## 模式语法

- 使用 `{key}` 作为占位符，会被替换为键的匹配正则
- 第一个捕获组 `($1)` 必须是键
- 模式使用 `gm` 标志（全局、多行）
- 使用 `\\W`（非单词字符）避免匹配变量名内部

## 自定义键正则

默认情况下，键匹配 `[\\w.-]+`（单词字符、点、连字符）。可以覆盖：

```jsonc
{
  "i18n-ally-next.regex.key": "[\\w.:-]+"
}
```

当你的键包含特殊字符（如命名空间的 `:`）时特别有用。

## 示例

### Vue I18n `$t()`

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\$t\\(\\s*['\"`]({key})['\"`]"
  ]
}
```

### React `<FormattedMessage id="..." />`

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\Wid=['\"`]({key})['\"`]"
  ]
}
```

### 自定义函数 `translate()`

```jsonc
{
  "i18n-ally-next.regex.usageMatchAppend": [
    "\\Wtranslate\\(\\s*['\"`]({key})['\"`]"
  ]
}
```
