# 最佳实践

本指南涵盖使用 i18n Ally Next 的推荐配置、工作流程和技巧。

## 框架指南

各框架的详细配置和使用方式：

- **[Vue I18n](/zh-CN/guide/frameworks/vue)** — Vue I18n、Vue SFC i18n 块
- **[React & Next.js](/zh-CN/guide/frameworks/react)** — React I18next、next-intl、next-i18next
- **[Angular](/zh-CN/guide/frameworks/angular)** — ngx-translate
- **[Svelte、Laravel 与 Rails](/zh-CN/guide/frameworks/others)** — svelte-i18n、Laravel、Ruby on Rails
- **[自定义框架](/zh-CN/guide/frameworks/custom)** — 通过 YAML 配置定义自己的框架
- **[Monorepo](/zh-CN/guide/monorepo)** — 多包工作区配置

## 通用技巧

### Key 命名规范

- 使用**点分隔的嵌套 key**：`section.subsection.key`
- 保持 key **描述性但简洁**：`auth.login.button` 而非 `the_login_button_text`
- 按**功能/页面**分组，而非按组件：`home.title` 而非 `header_component.title`
- 使用**统一的命名风格**：推荐 `kebab-case` 或 `snake_case`

### 提取工作流

1. **先写代码**，使用硬编码字符串
2. **批量提取**（`Cmd+Shift+P` → "Extract all hard-coded strings"）一次性提取所有字符串
3. **审查**生成的 key 并按需调整
4. **翻译**——使用内置的机器翻译或发送给翻译人员

### 翻译管理

- 将 `sourceLanguage` 设为主语言——其他语言会显示缺失翻译警告
- 使用**审阅系统**跨版本追踪翻译质量
- 启用**机器翻译**快速生成初稿：

```jsonc
{
  "i18n-ally-next.translate.engines": ["google"]
}
```

### 性能优化

- 大型项目中，限制语言文件路径以避免扫描不必要的目录：

```jsonc
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.ignoreFiles": ["node_modules/**", "dist/**"]
}
```

- 使用 `dirStructure: "dir"` 配合命名空间，将大型语言文件拆分为更小的专注文件
- 禁用不需要的解析器以加速文件扫描：

```jsonc
{
  "i18n-ally-next.enabledParsers": ["json"]
}
```
