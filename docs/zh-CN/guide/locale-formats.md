# 语言文件格式

i18n Ally Next 通过解析器系统支持多种语言文件格式。

## 支持的格式

| 格式 | 扩展名 | 解析器 ID |
| --- | --- | --- |
| **JSON** | `.json` | `json` |
| **JSON5** | `.json5` | `json5` |
| **YAML** | `.yml`, `.yaml` | `yaml` |
| **JavaScript** | `.js`, `.cjs`, `.mjs` | `js` |
| **TypeScript** | `.ts`, `.cts`, `.mts` | `ts` |
| **INI / Properties** | `.ini`, `.properties` | `ini` / `properties` |
| **PO (Gettext)** | `.po` | `po` |
| **PHP** | `.php` | `php` |
| **Fluent** | `.ftl` | `ftl` |

## 启用特定解析器

默认情况下，插件会根据检测到的框架启用解析器。你也可以手动覆盖：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledParsers": ["json", "yaml"]
}
```

## 扩展文件后缀

将自定义文件后缀映射到已有解析器：

```jsonc
{
  "i18n-ally-next.parsers.extendFileExtensions": {
    "lang": "json"
  }
}
```

这会将 `.lang` 文件映射到 JSON 解析器。

## 解析器选项

```jsonc
{
  // 写入语言文件时的缩进大小
  "i18n-ally-next.indent": 2,

  // 缩进风格: "space" 或 "tab"
  "i18n-ally-next.tabStyle": "space",

  // 文件编码
  "i18n-ally-next.encoding": "utf-8",

  // 写入时排序键
  "i18n-ally-next.sortKeys": true,

  // 排序比较方式: "binary" 或 "locale"
  "i18n-ally-next.sortCompare": "binary"
}
```
