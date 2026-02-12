# 常见问题

## 插件没有生效

1. 检查插件是否已启用 — 查看活动栏中是否有 i18n Ally 图标
2. 确保项目的 `package.json` 中有支持的框架依赖
3. 确认 `localesPaths` 配置正确
4. 打开输出面板 → 选择 **i18n Ally Next** 查看日志

## 内联注解不显示

- 检查 `i18n-ally-next.annotations` 是否为 `true`
- 确保 `displayLanguage` 已设置且对应的语言文件存在
- 确认文件的语言 ID 被框架支持

## 代码中的键未被检测到

- 检查 `usageMatchRegex` 模式是否匹配你的代码风格
- 使用 `regex.usageMatchAppend` 添加自定义匹配模式
- 确认 `regex.key` 允许你键中的特殊字符（如命名空间的 `:`）

## 命名空间不生效

1. 确保你的框架支持命名空间（参见[命名空间](/zh-CN/guide/namespace)）
2. i18next / react-i18next 会自动启用命名空间
3. 其他框架需要手动设置 `"i18n-ally-next.namespace": true`
4. 确认语言文件遵循 `{locale}/{namespace}.{ext}` 结构
5. 检查 `dirStructure` 是否设为 `"dir"`（而非 `"file"`）

## 语言文件未加载

- 检查 `localesPaths` 是否指向正确的目录
- 确认 `pathMatcher` 匹配你的文件结构
- 查看输出面板中的加载错误
- 确保 `ignoreFiles` 没有排除你的语言文件

## 如何在 monorepo 中使用？

在每个工作区文件夹中设置 `localesPaths`：

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["packages/app/locales"]
}
```

## 如何禁用特定项目？

```jsonc
{
  "i18n-ally-next.disabled": true
}
```

## 翻译不准确

机器翻译质量取决于引擎。建议：

- 使用 DeepL 或 OpenAI 获得更好的质量
- 启用 `translate.saveAsCandidates` 进行人工审阅
- 设置 `translate.promptSource` 在翻译前确认源文本
