# 项目概览与目录结构

## 项目简介

i18n Ally Next 是一个 VS Code 扩展插件，用于国际化（i18n）工作流的辅助开发。它支持多种 i18n 框架（如 i18next、vue-i18n、react-intl 等），提供翻译 key 的内联显示、跳转定义、自动补全、硬编码字符串提取、翻译管理等功能。

## 技术栈

- **语言**：TypeScript
- **构建**：Webpack（主扩展）+ Vite（Webview 编辑器）
- **测试**：ts-mocha + chai（单元测试）、@vscode/test-electron（e2e / fixture 测试）
- **包管理**：pnpm（workspace 模式）
- **代码规范**：ESLint

## 目录结构

```text
i18n-ally-next/
├── src/                        # 源代码
│   ├── extension.ts            # 插件入口，注册所有模块
│   ├── core/                   # 核心模块
│   │   ├── Config.ts           # 用户配置读取与管理
│   │   ├── Global.ts           # 全局状态管理
│   │   ├── CurrentFile.ts      # 当前活动文件的状态
│   │   ├── KeyDetector.ts      # 从源代码中检测 i18n key
│   │   ├── Nodes.ts            # LocaleTree / LocaleNode 数据结构
│   │   ├── types.ts            # 核心类型定义
│   │   ├── Analyst.ts          # 翻译覆盖率分析
│   │   ├── Review.ts           # 翻译审查功能
│   │   ├── Translator.ts       # 机器翻译集成
│   │   ├── Extract.ts          # 字符串提取核心逻辑
│   │   └── loaders/            # 翻译文件加载器
│   │       ├── Loader.ts       # 加载器基类（tree 构建、key 查找）
│   │       ├── LocaleLoader.ts # 主加载器（文件解析、tree 更新）
│   │       ├── ComposedLoader.ts # 组合加载器（聚合多个 loader）
│   │       ├── VueSfcLoader.ts # Vue SFC 加载器
│   │       └── FluentVueSfcLoader.ts # Fluent Vue SFC 加载器
│   │
│   ├── editor/                 # 编辑器功能
│   │   ├── annotation.ts       # 内联翻译显示
│   │   ├── definition.ts       # Go to Definition（跳转定义）
│   │   ├── hover.ts            # 悬停提示
│   │   ├── completion.ts       # 自动补全
│   │   ├── reference.ts        # Find References
│   │   ├── refactor.ts         # 重构（重命名 key 等）
│   │   ├── extract.ts          # 字符串提取 CodeAction
│   │   ├── problems.ts         # 问题诊断
│   │   ├── reviewComments.ts   # 翻译审查评论
│   │   └── statusbar.ts        # 状态栏显示
│   │
│   ├── frameworks/             # 框架适配层（30+ 种）
│   │   ├── base.ts             # Framework 基类
│   │   ├── custom.ts           # 自定义框架（用户通过 YAML 配置）
│   │   ├── i18next.ts          # i18next 框架
│   │   ├── react-i18next.ts    # react-i18next 框架
│   │   ├── vue.ts              # vue-i18n 框架
│   │   └── index.ts            # 框架注册与检测
│   │
│   ├── parsers/                # 翻译文件解析器
│   │   ├── base.ts             # Parser 基类（navigateToKey 等）
│   │   ├── json.ts / yaml.ts   # JSON / YAML 解析器
│   │   └── ecmascript.ts       # JS/TS 解析器
│   │
│   ├── utils/                  # 工具函数
│   │   ├── NodeHelper.ts       # key 路径处理
│   │   ├── Regex.ts            # 正则匹配
│   │   ├── PathMatcher.ts      # 文件路径匹配
│   │   └── flat.ts             # 对象扁平化 / 反扁平化
│   │
│   ├── commands/               # VS Code 命令
│   ├── views/                  # TreeView 侧边栏
│   ├── translators/            # 翻译引擎集成
│   ├── extraction/             # 硬编码字符串检测
│   ├── webview/                # Webview 编辑器（Vite 构建）
│   └── meta.ts                 # 常量定义（KEY_REG 等）
│
├── test/                       # 测试
│   ├── unit/                   # 单元测试（ts-mocha）
│   ├── e2e/                    # E2E 测试（VS Code 扩展宿主）
│   ├── fixtures/               # Fixture 测试用例（字符串提取）
│   └── fixture-scripts/        # Fixture 测试运行器
│
├── locales/                    # 插件自身的 i18n 翻译文件
├── scripts/                    # 构建脚本
├── examples/                   # 各框架的示例项目（也用于 e2e 测试 fixture）
├── res/                        # 静态资源（图标、Webview HTML 等）
├── docs/                       # 文档站点（VitePress）
├── package.json                # 插件清单 + 依赖 + 配置项定义
├── webpack.config.js           # 主扩展 Webpack 配置
└── tsconfig.json               # TypeScript 配置
```

## 关键配置文件

| 文件 | 说明 |
| --- | --- |
| `package.json` | 插件清单，定义了所有 VS Code 配置项（`contributes.configuration`）、命令、菜单等 |
| `webpack.config.js` | 主扩展的打包配置，输出 `extension.js` |
| `src/webview/vite.config.ts` | Webview 编辑器的 Vite 构建配置 |
| `tsconfig.json` | 主 TypeScript 配置，使用 `~` 路径别名指向 `src/` |
| `package.nls.*.json` | 插件 UI 的多语言翻译文件 |
