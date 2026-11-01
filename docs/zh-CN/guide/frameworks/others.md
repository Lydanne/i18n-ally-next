# Svelte、Laravel 与 Ruby on Rails

## Svelte (svelte-i18n)

### 推荐配置

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/lib/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

### 使用方式

```svelte
<script>
  import { _ } from 'svelte-i18n'
</script>

<h1>{$_('home.title')}</h1>
<p>{$_('home.description', { values: { name: 'World' } })}</p>
```

## Paraglide.js

使用常见的 `messages/{locale}.json` 目录时，将 `i18n-ally-next.localesPaths` 设置为 `["messages"]`。扩展会检测 `@inlang/paraglide-js`，并在 `m` 从 `paraglide/messages` 模块导入时识别 JavaScript、TypeScript 和组件脚本中的 `m.hello_world()`、`m['hello-world']()` 等静态调用，也支持命名空间别名。

目前不能识别 `m[key]()` 等动态调用、Vue 或 Svelte 模板内的调用，以及不含 `paraglide/messages` 路径片段的自定义生成目录；这些调用可能在使用报告中显示为未使用。复杂消息变体、嵌套 key 的生成名称和文本提取暂不支持。

## Laravel

### 推荐配置

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["resources/lang"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.enabledParsers": ["php", "json"]
}
```

### 项目结构

```text
resources/
└── lang/
    ├── en/
    │   ├── messages.php
    │   └── validation.php
    ├── zh-CN/
    │   ├── messages.php
    │   └── validation.php
    └── en.json        # JSON 翻译（可选）
```

### 使用方式

```php
// Blade 模板
{{ __('messages.welcome') }}
@lang('messages.welcome')

// PHP 代码
__('messages.welcome')
trans('messages.welcome')
trans_choice('messages.items', $count)
```

## Ruby on Rails

### 推荐配置

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["config/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.enabledParsers": ["yaml"]
}
```

### 项目结构

```text
config/
└── locales/
    ├── en.yml
    ├── zh-CN.yml
    └── ja.yml
```

### 使用方式

```erb
<%# ERB 模板 %>
<h1><%= t('home.title') %></h1>
<p><%= t('.description') %></p>  <%# 惰性查找（相对于视图路径） %>
```

```ruby
# Ruby 代码
I18n.t('home.title')
I18n.t(:title, scope: :home)
```
