# Svelte, Laravel & Ruby on Rails

## Svelte (svelte-i18n)

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["src/lib/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested"
}
```

### Usage Patterns

```svelte
<script>
  import { _ } from 'svelte-i18n'
</script>

<h1>{$_('home.title')}</h1>
<p>{$_('home.description', { values: { name: 'World' } })}</p>
```

## Paraglide.js

For the usual `messages/{locale}.json` layout, set `i18n-ally-next.localesPaths` to `["messages"]`. The extension detects `@inlang/paraglide-js` and recognizes static calls such as `m.hello_world()` and `m['hello-world']()` when `m` is imported from a `paraglide/messages` module. Namespace aliases are supported in JavaScript, TypeScript and component script blocks.

Dynamic calls such as `m[key]()`, calls in Vue or Svelte templates, and custom generated paths without a `paraglide/messages` segment are not detected. These usages may appear unused in the usage report. Complex message variants, generated names for nested message keys and extraction are not yet supported.

## Laravel

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["resources/lang"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.enabledParsers": ["php", "json"]
}
```

### Project Structure

```text
resources/
└── lang/
    ├── en/
    │   ├── messages.php
    │   └── validation.php
    ├── zh-CN/
    │   ├── messages.php
    │   └── validation.php
    └── en.json        # JSON translations (optional)
```

### Usage Patterns

```php
// Blade templates
{{ __('messages.welcome') }}
@lang('messages.welcome')

// PHP code
__('messages.welcome')
trans('messages.welcome')
trans_choice('messages.items', $count)
```

## Ruby on Rails

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["config/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.enabledParsers": ["yaml"]
}
```

### Project Structure

```text
config/
└── locales/
    ├── en.yml
    ├── zh-CN.yml
    └── ja.yml
```

### Usage Patterns

```erb
<%# ERB templates %>
<h1><%= t('home.title') %></h1>
<p><%= t('.description') %></p>  <%# Lazy lookup (relative to view path) %>
```

```ruby
# Ruby code
I18n.t('home.title')
I18n.t(:title, scope: :home)
```
