# 配置项参考

所有配置项在 `.vscode/settings.json` 中以 `i18n-ally-next.` 为前缀。

## 通用

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 禁用插件 |
| `autoDetection` | `boolean` | `true` | 自动检测框架和语言文件路径 |
| `localesPaths` | `string \| string[]` | — | 语言文件目录路径（相对于工作区根目录） |
| `encoding` | `string` | `"utf-8"` | 语言文件编码 |
| `readonly` | `boolean` | `false` | 禁止写入语言文件 |

## 语言

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `sourceLanguage` | `string` | `"en"` | 翻译源语言 |
| `displayLanguage` | `string` | — | 内联注解显示的语言 |
| `ignoredLocales` | `string[]` | `[]` | 在侧边栏中隐藏的语言 |
| `languageTagSystem` | `"bcp47" \| "legacy" \| "none"` | `"bcp47"` | 语言标签规范化系统 |
| `localeCountryMap` | `object` | `{}` | 自定义语言到国旗的映射 |
| `showFlags` | `boolean` | `true` | 在侧边栏显示国旗图标 |

## 键风格与结构

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `keystyle` | `"auto" \| "nested" \| "flat"` | `"auto"` | 键的组织方式 |
| `dirStructure` | `"auto" \| "file" \| "dir"` | `"auto"` | 语言文件目录结构 |
| `disablePathParsing` | `boolean` | `false` | 将键视为扁平字符串（不解析点路径） |
| `namespace` | `boolean` | — | 启用命名空间（部分框架自动启用） |
| `defaultNamespace` | `string` | — | 无显式前缀的键使用的默认命名空间 |
| `pathMatcher` | `string` | — | 自定义路径匹配模式 |

## 注解

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `annotations` | `boolean` | `true` | 显示内联注解 |
| `annotationInPlace` | `boolean` | `true` | 用翻译内容替换键文本 |
| `annotationMaxLength` | `number` | `40` | 注解文本最大字符数 |
| `annotationDelimiter` | `string` | `"·"` | 注解文本前的分隔符 |

## 主题

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `theme.annotation` | `string` | `"rgba(153,153,153,.8)"` | 注解文本颜色 |
| `theme.annotationMissing` | `string` | `"rgba(153,153,153,.3)"` | 缺失翻译注解颜色 |
| `theme.annotationBorder` | `string` | `"rgba(153,153,153,.2)"` | 原位注解边框颜色 |
| `theme.annotationMissingBorder` | `string` | `"rgba(153,153,153,.2)"` | 缺失原位注解边框颜色 |

## 框架与解析器

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabledFrameworks` | `string[]` | — | 手动指定框架 |
| `enabledParsers` | `string[]` | — | 手动指定文件解析器 |
| `parsers.extendFileExtensions` | `object` | `{}` | 将自定义后缀映射到解析器 |

## 正则

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `regex.key` | `string` | `"[\\w.-]+"` | 匹配键字符的正则 |
| `regex.usageMatch` | `string[]` | — | 覆盖所有使用匹配模式 |
| `regex.usageMatchAppend` | `string[]` | `[]` | 追加额外的使用匹配模式 |

## 文案提取

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `extract.autoDetect` | `boolean` | `false` | 自动检测硬编码字符串 |
| `extract.keygenStrategy` | `"slug" \| "random"` | `"slug"` | 键名生成策略 |
| `extract.keygenStyle` | `string` | `"default"` | 键名命名风格 |
| `extract.keyMaxLength` | `number` | `Infinity` | 生成键名的最大长度 |
| `extract.keyPrefix` | `string` | `""` | 生成键名的前缀 |
| `extract.targetPickingStrategy` | `string` | `"none"` | 目标语言文件选择策略 |
| `extract.ignored` | `string[]` | `[]` | 提取时忽略的字符串 |
| `extract.ignoredByFiles` | `object` | `{}` | 按文件忽略的字符串 |
| `refactor.templates` | `object[]` | `[]` | 自定义重构模板 |

## 翻译

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `translate.engines` | `string[]` | `["google"]` | 翻译引擎 |
| `translate.parallels` | `number` | `5` | 并行翻译请求数 |
| `translate.promptSource` | `boolean` | `false` | 翻译源语言前提示 |
| `translate.overrideExisting` | `boolean` | `false` | 覆盖已有翻译 |
| `translate.saveAsCandidates` | `boolean` | `false` | 保存为审阅候选 |
| `translate.fallbackToKey` | `boolean` | `false` | 使用键名作为回退文本 |
| `translate.google.apiKey` | `string` | — | Google 翻译 API Key |
| `translate.deepl.apiKey` | `string` | — | DeepL API Key |
| `translate.deepl.useFreeApiEntry` | `boolean` | `false` | 使用 DeepL 免费 API |
| `translate.baidu.appid` | `string` | — | 百度翻译 App ID |
| `translate.baidu.apiSecret` | `string` | — | 百度翻译 API Secret |
| `translate.libre.apiRoot` | `string` | `"http://localhost:5000"` | LibreTranslate API 地址 |
| `translate.openai.apiKey` | `string` | — | OpenAI API Key |
| `translate.openai.apiRoot` | `string` | `"https://api.openai.com"` | OpenAI API 地址 |
| `translate.openai.apiModel` | `string` | `"gpt-3.5-turbo"` | OpenAI 模型 |

## 审阅

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `review.enabled` | `boolean` | `true` | 启用审阅系统 |
| `review.gutters` | `boolean` | `true` | 显示审阅行号图标 |
| `review.user.name` | `string` | — | 审阅者名称（默认取 git 配置） |
| `review.user.email` | `string` | — | 审阅者邮箱（默认取 git 配置） |
| `review.removeCommentOnResolved` | `boolean` | `false` | 解决时删除评论 |

## 文件写入

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `indent` | `number` | `2` | 缩进大小 |
| `tabStyle` | `"space" \| "tab"` | `"space"` | 缩进字符 |
| `sortKeys` | `boolean` | `false` | 写入时排序键 |
| `sortCompare` | `"binary" \| "locale"` | `"binary"` | 排序比较方式 |
| `sortLocale` | `string` | — | 语言感知排序的语言 |
| `keepFulfilled` | `boolean` | `false` | 保留已填充的键在待处理列表中 |

## 使用分析

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `keysInUse` | `string[]` | `[]` | 手动标记为使用中的键 |
| `usage.derivedKeyRules` | `string[]` | — | 派生键规则（如复数形式） |
| `usage.scanningIgnore` | `string[]` | `[]` | 扫描使用时忽略的 glob 模式 |

## 其他

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `preferredDelimiter` | `string` | `"-"` | 语言代码首选分隔符 |
| `fullReloadOnChanged` | `boolean` | `false` | 文件变更时完全重新加载 |
| `includeSubfolders` | `boolean` | `true` | 扫描时包含子文件夹 |
| `ignoreFiles` | `string[]` | `[]` | 忽略文件的 glob 模式 |
| `editor.preferEditor` | `boolean` | `false` | 优先使用编辑器 UI |
