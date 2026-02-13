# React & Next.js

## React I18next

### 推荐配置

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

### 项目结构（含命名空间）

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

### 使用方式

```tsx
import { useTranslation, Trans } from 'react-i18next'

function App() {
  // Hook 方式 — 命名空间作用域会被自动检测
  const { t } = useTranslation('common')
  const title = t('title')                    // → common:title
  const desc = t('home:description')          // → 显式命名空间

  return (
    <>
      <h1>{t('title')}</h1>

      {/* Trans 组件用于富文本 */}
      <Trans i18nKey="common:welcome">
        你好 <strong>{{ name }}</strong>
      </Trans>
    </>
  )
}
```

### 命名空间技巧

- 使用 `:` 或 `/` 作为命名空间分隔符：`t("common:ok")` 或 `t("common/ok")`
- 设置默认命名空间避免重复书写：

```jsonc
{
  "i18n-ally-next.defaultNamespace": "common"
}
```

## Next.js (next-intl)

### 推荐配置

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

### 项目结构

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

### 使用方式

```tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  // 通过 useTranslations 进行命名空间作用域
  const t = useTranslations('home')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {/* 富文本 */}
      <p>{t.rich('terms', { link: (chunks) => <a href="/terms">{chunks}</a> })}</p>
    </div>
  )
}
```

### 语言文件中的嵌套 Key

```json
{
  "home": {
    "title": "欢迎",
    "description": "这是首页"
  },
  "settings": {
    "title": "设置"
  }
}
```

## Next.js (next-i18next)

### 推荐配置

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

### 项目结构

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
