# 支持的框架

i18n Ally Next 开箱即用地支持多种 i18n 框架，通过读取项目依赖文件自动检测。

## Web 框架

| 框架 | 包检测 | 命名空间 | 语言 ID |
| --- | --- | --- | --- |
| **Vue I18n** | `vue-i18n`, `vuex-i18n`, `@panter/vue-i18next` | - | vue, js, ts, html, pug |
| **Vue SFC** | `vue-i18n`, `@panter/vue-i18next` | VueSfc | vue |
| **React I18next** | `react-i18next`, `next-i18next` | ✅ | js, ts, jsx, tsx, ejs |
| **React Intl** | `react-intl` | - | js, ts, jsx, tsx |
| **i18next** | `i18next`（不含 `react-i18next`） | ✅ | js, ts, jsx, tsx, ejs |
| **i18next Shopify** | `@shopify/react-i18n` | - | js, ts, jsx, tsx |
| **Next-intl** | `next-intl` | ✅ | js, ts, jsx, tsx |
| **Next International** | `next-international` | ✅ | js, ts, jsx, tsx |
| **Next Translate** | `next-translate` | ✅ | js, ts, jsx, tsx |
| **Svelte** | `svelte-i18n` | - | svelte, js, ts |
| **Lingui** | `@lingui/core` | - | js, ts, jsx, tsx |
| **Polyglot** | `node-polyglot` | - | js, ts, jsx, tsx |
| **i18n-tag** | `es2015-i18n-tag` | - | js, ts |

## Angular

| 框架 | 包检测 | 语言 ID |
| --- | --- | --- |
| **ngx-translate** | `@ngx-translate/core` | html, ts |
| **Transloco** | `@ngneat/transloco` | html, ts |

## 移动端

| 框架 | 包检测 | 语言 ID |
| --- | --- | --- |
| **Flutter** | `flutter_i18n`, `flutter_localizations` | dart |

## 后端 / 其他

| 框架 | 包检测 | 语言 ID |
| --- | --- | --- |
| **Laravel** | `laravel-mix`, `vite-plugin-laravel` | php |
| **Ruby on Rails** | `i18n`（Gemfile） | ruby, erb, slim, haml |
| **PHP Gettext** | `gettext/gettext` | php |
| **VS Code 扩展** | `vscode` | js, ts |
| **Chrome 扩展** | `webextension-polyfill` | js, ts, jsx, tsx |
| **Ember** | `ember-intl`, `ember-i18n` | js, ts, handlebars |
| **Globalize** | `globalize` | js, ts |
| **UI5** | `@openui5/sap.ui.core` | js, ts, xml |
| **Jekyll** | `jekyll-multiple-languages-plugin` | html, md |
| **Fluent Vue** | `fluent-vue` | vue, js, ts |
| **General** | `i18n-ally-next` | js, ts, jsx, tsx |

## 自定义框架

如果你的框架不在上述列表中，可以定义[自定义框架](/zh-CN/guide/custom-framework)来适配任何 i18n 方案。

## 手动选择框架

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["react-i18next", "custom"]
}
```
