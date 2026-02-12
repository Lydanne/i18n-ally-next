# Namespace

Namespace allows you to split translations into multiple files organized by feature or module. For example, `t("review:description")` refers to the `description` key in the `review` namespace.

## How It Works

When namespace is enabled:

1. **File matching** uses `{locale}/**/{namespace}.{ext}` pattern, so `locales/en/review.json` maps to namespace `review`
2. **Key resolution** converts `review:description` → looks up `description` in `review.json`
3. **Tree building** organizes keys under their namespace prefix internally

## Supported Frameworks

The following frameworks have built-in namespace support:

| Framework | Delimiter | Auto Enabled |
| --- | --- | --- |
| **react-i18next** | `:` or `/` | ✅ |
| **i18next** | `:` or `/` | ✅ |
| **next-intl** | `.` | ✅ |
| **next-international** | `.` | ✅ |
| **next-translate** | — | ✅ |
| **laravel** | — | ✅ |
| **php-gettext** | — | ✅ |
| **custom** | Configurable | Via config |

## File Structure

Organize your locale files by namespace:

```text
locales/
├── en/
│   ├── common.json      # namespace: common
│   ├── review.json      # namespace: review
│   └── settings.json    # namespace: settings
├── zh-CN/
│   ├── common.json
│   ├── review.json
│   └── settings.json
```

Each file contains only the keys for that namespace:

```json
// locales/en/review.json
{
  "description": "Description",
  "approve": "Approve",
  "reject": "Reject"
}
```

## Usage in Code

### react-i18next / i18next

```tsx
// Explicit namespace with `:` delimiter
t("review:description")    // → looks up "description" in review.json
t("common:greeting")       // → looks up "greeting" in common.json

// With useTranslation hook (scope-based)
const { t } = useTranslation("review")
t("description")           // → automatically scoped to review namespace

// With ns option
t("description", { ns: "review" })
```

### next-intl

```tsx
// Namespace via useTranslations
const t = useTranslations("review")
t("description")
```

## Manual Configuration

For frameworks without built-in namespace support, enable it manually:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.namespace": true
}
```

### Default Namespace

If most of your keys belong to one namespace, set a default:

```jsonc
{
  "i18n-ally-next.defaultNamespace": "common"
}
```

Keys without an explicit namespace prefix will be resolved under the default namespace.

### Custom Path Matcher

If your file structure doesn't follow the default pattern, use a custom path matcher:

```jsonc
{
  "i18n-ally-next.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

## Custom Framework

You can enable namespace in a [custom framework](/guide/custom-framework) config:

```yaml
# .vscode/i18n-ally-next-custom-framework.yml
languageIds:
  - typescript
  - typescriptreact
usageMatchRegex:
  - "\\Wt\\(\\s*['\"`]({key})['\"`]"
namespace: true
namespaceDelimiter: ":"
```
