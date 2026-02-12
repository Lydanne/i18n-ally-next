<p align="center">
<img src="https://github.com/lydanne/i18n-ally-next/blob/main/res/logo.png?raw=true" alt="i18n Ally Next" width="128"/>
</p>

<h1 align="center">i18n Ally Next</h1>

<p align="center">
<b>VS Code 全能国际化插件</b>
</p>

<p align="center">
<a href="https://github.com/lydanne/i18n-ally-next/blob/main/readme.md">English</a> | 简体中文
</p>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next"><img src="https://img.shields.io/visual-studio-marketplace/v/lydanne.i18n-ally-next?color=6366f1&amp;label=Marketplace&logo=visual-studio-code" alt="VS Code Marketplace" /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next"><img src="https://img.shields.io/visual-studio-marketplace/d/lydanne.i18n-ally-next?color=06b6d4" alt="Downloads" /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=lydanne.i18n-ally-next"><img src="https://img.shields.io/visual-studio-marketplace/i/lydanne.i18n-ally-next?color=10b981" alt="Installs" /></a>
<a href="https://github.com/lydanne/i18n-ally-next"><img alt="GitHub stars" src="https://img.shields.io/github/stars/lydanne/i18n-ally-next?style=social"></a>
</p>

---

## 功能特性

- **🌍 内联注解** — 在代码中直接查看翻译内容
- **🔍 悬浮预览** — 悬浮即可预览所有翻译，一键编辑
- **📦 文案提取** — 检测硬编码字符串，一键提取到语言文件
- **🤖 机器翻译** — 支持 Google、DeepL、百度、OpenAI 等引擎
- **🗂 命名空间** — 支持 `t("ns:key")` 风格的命名空间组织
- **📝 审阅系统** — 内置翻译审阅和团队协作
- **🧩 30+ 框架** — Vue、React、Angular、Svelte、Flutter 等
- **🎨 自定义框架** — 通过 YAML 配置定义你自己的框架

## 快速开始

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

> 框架会从 `package.json` 自动检测。完整列表见[支持的框架](#支持的框架)。

## 截图

<h4 align="center">内联注解</h4>

![](https://github.com/lydanne/i18n-ally-next/blob/screenshots/annotation-animated.gif?raw=true)

<h4 align="center">悬浮预览与快捷操作</h4>

![](https://github.com/lydanne/i18n-ally-next/blob/screenshots/hover.png?raw=true)

<h4 align="center">可视化编辑器与审阅系统</h4>

![](https://github.com/lydanne/i18n-ally-next/blob/screenshots/review-editor.png?raw=true)

<h4 align="center">从代码中提取文案</h4>

![](https://github.com/lydanne/i18n-ally-next/blob/screenshots/extract.png?raw=true)

<h4 align="center">机器翻译</h4>

![](https://github.com/lydanne/i18n-ally-next/blob/screenshots/quick-actions.png?raw=true)

## 支持的框架

| 分类 | 框架 |
| --- | --- |
| **Vue** | Vue I18n, Vue SFC, Fluent Vue |
| **React** | React I18next, React Intl, Lingui |
| **Next.js** | next-intl, next-i18next, next-translate, next-international |
| **Angular** | ngx-translate, Transloco |
| **其他** | Svelte, Ember, i18n-tag, Polyglot, Globalize, UI5 |
| **移动端** | Flutter |
| **后端** | Laravel, Ruby on Rails, PHP Gettext |
| **工具** | VS Code 扩展, Chrome 扩展, Jekyll |
| **自定义** | [定义你自己的框架](https://lydanne.github.io/i18n-ally-next/zh-CN/guide/custom-framework) |

## 文档

📖 **[完整文档](https://lydanne.github.io/i18n-ally-next/zh-CN/)** — 快速开始、配置项、命名空间、自定义框架等。

## ❤️ 致谢

本插件最初受 [think2011/vscode-vue-i18n](https://github.com/think2011/vscode-vue-i18n) 启发。Vue SFC 支持由 [kazupon/vue-i18n-locale-message](https://github.com/kazupon/vue-i18n-locale-message) 提供。

### 贡献者

<a href="https://github.com/lydanne/i18n-ally-next/graphs/contributors"><img src="https://contrib.rocks/image?repo=lydanne/i18n-ally-next" /></a>

## 📄 License

[MIT](./LICENSE) © 2025 至今 [Lydanne](https://github.com/lydanne) | MIT © 2021-2024 [Lokalise](https://github.com/lokalise) | MIT © 2019-2020 [Anthony Fu](https://github.com/antfu) | MIT © 2018-2019 [think2011](https://github.com/think2011)
