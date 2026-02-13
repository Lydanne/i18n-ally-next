# Best Practices

This guide covers recommended configurations, workflows, and tips for using i18n Ally Next effectively.

## Framework Guides

Detailed setup and usage patterns for each framework:

- **[Vue I18n](/guide/frameworks/vue)** — Vue I18n, Vue SFC i18n blocks
- **[React & Next.js](/guide/frameworks/react)** — React I18next, next-intl, next-i18next
- **[Angular](/guide/frameworks/angular)** — ngx-translate
- **[Svelte, Laravel & Rails](/guide/frameworks/others)** — svelte-i18n, Laravel, Ruby on Rails
- **[Custom Framework](/guide/frameworks/custom)** — Define your own framework via YAML config
- **[Monorepo](/guide/monorepo)** — Multi-package workspace configuration

## General Tips

### Key Naming Conventions

- Use **dot-separated nested keys**: `section.subsection.key`
- Keep keys **descriptive but concise**: `auth.login.button` instead of `the_login_button_text`
- Group by **feature/page**, not by component: `home.title` instead of `header_component.title`
- Use **consistent casing**: prefer `kebab-case` or `snake_case` for key segments

### Extraction Workflow

1. **Write code first** with hard-coded strings
2. **Run batch extraction** (`Cmd+Shift+P` → "Extract all hard-coded strings") to extract all strings at once
3. **Review** the generated keys and adjust if needed
4. **Translate** using the built-in machine translation or send to translators

### Translation Management

- Set `sourceLanguage` to your primary language — other languages will show missing translation warnings
- Use the **Review System** to track translation quality across releases
- Enable **Machine Translation** for quick drafts:

```jsonc
{
  "i18n-ally-next.translate.engines": ["google"]
}
```

### Performance Tips

- For large projects, limit the locale paths to avoid scanning unnecessary directories:

```jsonc
{
  "i18n-ally-next.localesPaths": ["src/locales"],
  "i18n-ally-next.ignoreFiles": ["node_modules/**", "dist/**"]
}
```

- Use `dirStructure: "dir"` with namespaces to split large locale files into smaller, focused files
- Disable unused parsers to speed up file scanning:

```jsonc
{
  "i18n-ally-next.enabledParsers": ["json"]
}
```
