# React & Next.js

## React I18next

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["public/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.dirStructure": "dir",
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json"
}
```

### Project Structure (with Namespaces)

```text
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── home.json
    │   └── settings.json
    └── zh-CN/
        ├── common.json
        ├── home.json
        └── settings.json
```

### Usage Patterns

```tsx
import { useTranslation, Trans } from 'react-i18next'

function App() {
  // Hook-based — namespace scoping is auto-detected
  const { t } = useTranslation('common')
  const title = t('title')                    // → common:title
  const desc = t('home:description')          // → explicit namespace

  return (
    <>
      <h1>{t('title')}</h1>

      {/* Trans component for rich text */}
      <Trans i18nKey="common:welcome">
        Hello <strong>{{ name }}</strong>
      </Trans>
    </>
  )
}
```

### Namespace Tips

- Use `:` or `/` as namespace delimiter: `t("common:ok")` or `t("common/ok")`
- Set a default namespace to avoid repeating it:

```jsonc
{
  "i18n-ally-next.defaultNamespace": "common"
}
```

## Next.js (next-intl)

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["messages"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.dirStructure": "file",
  "i18n-ally-next.pathMatcher": "{locale}.json"
}
```

### Project Structure

```text
messages/
├── en.json
├── zh-CN.json
└── ja.json
src/
├── app/
│   └── [locale]/
│       └── page.tsx
└── components/
```

### Usage Patterns

```tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  // Namespace scoping via useTranslations
  const t = useTranslations('home')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {/* Rich text */}
      <p>{t.rich('terms', { link: (chunks) => <a href="/terms">{chunks}</a> })}</p>
    </div>
  )
}
```

### Nested Keys in Locale Files

```json
{
  "home": {
    "title": "Welcome",
    "description": "This is the home page"
  },
  "settings": {
    "title": "Settings"
  }
}
```

## Next.js (next-i18next)

### Recommended Setup

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["public/locales"],
  "i18n-ally-next.sourceLanguage": "en",
  "i18n-ally-next.keystyle": "nested",
  "i18n-ally-next.dirStructure": "dir",
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.json"
}
```

### Project Structure

```text
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   └── home.json
    └── zh-CN/
        ├── common.json
        └── home.json
```
