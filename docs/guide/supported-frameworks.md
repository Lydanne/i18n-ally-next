# Supported Frameworks

i18n Ally Next supports a wide range of i18n frameworks out of the box. It auto-detects the framework by reading your project's dependency files.

## Web Frameworks

| Framework | Package Detection | Namespace | Language IDs |
| --- | --- | --- | --- |
| **Vue I18n** | `vue-i18n`, `vuex-i18n`, `@panter/vue-i18next` | - | vue, js, ts, html, pug |
| **Vue SFC** | `vue-i18n`, `@panter/vue-i18next` | VueSfc | vue |
| **React I18next** | `react-i18next`, `next-i18next` | ✅ | js, ts, jsx, tsx, ejs |
| **React Intl** | `react-intl` | - | js, ts, jsx, tsx |
| **i18next** | `i18next` (without `react-i18next`) | ✅ | js, ts, jsx, tsx, ejs |
| **i18next Shopify** | `@shopify/react-i18n` | - | js, ts, jsx, tsx |
| **Next-intl** | `next-intl` | ✅ | js, ts, jsx, tsx |
| **Next International** | `next-international` | ✅ | js, ts, jsx, tsx |
| **Next Translate** | `next-translate` | ✅ | js, ts, jsx, tsx |
| **Svelte** | `svelte-i18n` | - | svelte, js, ts |
| **Lingui** | `@lingui/core` | - | js, ts, jsx, tsx |
| **Polyglot** | `node-polyglot` | - | js, ts, jsx, tsx |
| **i18n-tag** | `es2015-i18n-tag` | - | js, ts |

## Angular

| Framework | Package Detection | Language IDs |
| --- | --- | --- |
| **ngx-translate** | `@ngx-translate/core` | html, ts |
| **Transloco** | `@ngneat/transloco` | html, ts |

## Mobile

| Framework | Package Detection | Language IDs |
| --- | --- | --- |
| **Flutter** | `flutter_i18n`, `flutter_localizations` | dart |

## Backend / Other

| Framework | Package Detection | Language IDs |
| --- | --- | --- |
| **Laravel** | `laravel-mix`, `vite-plugin-laravel` | php |
| **Ruby on Rails** | `i18n` (Gemfile) | ruby, erb, slim, haml |
| **PHP Gettext** | `gettext/gettext` | php |
| **VS Code Extension** | `vscode` | js, ts |
| **Chrome Extension** | `webextension-polyfill` | js, ts, jsx, tsx |
| **Ember** | `ember-intl`, `ember-i18n` | js, ts, handlebars |
| **Globalize** | `globalize` | js, ts |
| **UI5** | `@openui5/sap.ui.core` | js, ts, xml |
| **Jekyll** | `jekyll-multiple-languages-plugin` | html, md |
| **Fluent Vue** | `fluent-vue` | vue, js, ts |
| **General** | `i18n-ally-next` | js, ts, jsx, tsx |

## Custom Framework

If your framework is not listed above, you can define a [Custom Framework](/guide/custom-framework) to make i18n Ally Next work with any i18n solution.

## Manual Framework Selection

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.enabledFrameworks": ["react-i18next", "custom"]
}
```
