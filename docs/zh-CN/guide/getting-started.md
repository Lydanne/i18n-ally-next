# 快速开始

## 安装

在 VS Code 扩展面板中搜索 **i18n Ally Next**，或从以下渠道安装：

- [VS Code 插件市场](https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next)
- [Open VSX Registry](https://open-vsx.org/extension/lydanne/i18n-ally-next)

## 基本配置

### 1. 框架检测

i18n Ally Next 会自动读取 `package.json` 中的依赖来检测你使用的 i18n 框架。支持 Vue I18n、React I18next、Next-intl、Angular ngx-translate 等[众多框架](/zh-CN/guide/supported-frameworks)。

如果自动检测不生效，可以手动指定：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["react-i18next"]
}
```

### 2. 配置语言文件路径

插件会尝试自动检测语言文件位置。如果失败，手动设置路径：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"]
}
```

### 3. 设置源语言

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.sourceLanguage": "en"
}
```

### 4. 设置显示语言

显示语言决定了内联注解中展示的翻译内容：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

## 目录结构

i18n Ally Next 支持两种目录结构：

### 文件模式

每个语言一个文件：

```text
locales/
├── en.json
├── zh-CN.json
└── ja.json
```

### 目录模式

每个语言一个目录，包含多个命名空间文件：

```text
locales/
├── en/
│   ├── common.json
│   └── review.json
├── zh-CN/
│   ├── common.json
│   └── review.json
```

如果自动检测不准确，可以手动设置：

```jsonc
{
  "i18n-ally-next.dirStructure": "dir"
}
```

## 键风格

- **nested** — 嵌套结构：`{ "common": { "ok": "确定" } }`，引用为 `common.ok`
- **flat** — 扁平结构：`{ "common.ok": "确定" }`，引用为 `common.ok`

```jsonc
{
  "i18n-ally-next.keystyle": "nested"
}
```

## 下一步

- [命名空间支持](/zh-CN/guide/namespace) — 使用 `t("ns:key")` 组织翻译
- [自定义框架](/zh-CN/guide/custom-framework) — 定义你自己的框架
- [配置项参考](/zh-CN/config/) — 所有可用配置
