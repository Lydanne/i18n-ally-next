# Migration from i18n-ally

If you are migrating from the original **i18n-ally** extension to **i18n-ally-next**, this guide will help you transfer your existing configuration.

## Automatic Migration

i18n Ally Next provides a built-in migration command that automatically transfers your configuration.

### Run the Migration Command

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Search for **"i18n Ally Next: Migrate from i18n-ally"**
3. Review the migration summary and confirm

### What Gets Migrated

The migration command handles the following:

| Item | From | To |
|------|------|-----|
| **Workspace Settings** | `i18n-ally.*` / `vue-i18n-ally.*` | `i18n-ally-next.*` |
| **Global Settings** | `i18n-ally.*` / `vue-i18n-ally.*` | `i18n-ally-next.*` |
| **Custom Framework** | `.vscode/i18n-ally-custom-framework.yml` | `.vscode/i18n-ally-next-custom-framework.yml` |
| **Reviews File** | `.vscode/i18n-ally-reviews.yml` | `.vscode/i18n-ally-next-reviews.yml` |

## Manual Migration

If you prefer to migrate manually, follow these steps:

### 1. Update Settings

In your `.vscode/settings.json`, rename all `i18n-ally.*` or `vue-i18n-ally.*` settings to `i18n-ally-next.*`:

```diff
{
-  "i18n-ally.localesPaths": ["src/locales"],
-  "i18n-ally.sourceLanguage": "en",
-  "i18n-ally.displayLanguage": "zh-CN"
+  "i18n-ally-next.localesPaths": ["src/locales"],
+  "i18n-ally-next.sourceLanguage": "en",
+  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

Also check your global (user-level) settings (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)") for any `i18n-ally.*` or `vue-i18n-ally.*` entries and rename them as well.

### 2. Rename Custom Framework File

If you have a custom framework configuration:

```bash
mv .vscode/i18n-ally-custom-framework.yml .vscode/i18n-ally-next-custom-framework.yml
```

### 3. Rename Reviews File

If you use the review feature:

```bash
mv .vscode/i18n-ally-reviews.yml .vscode/i18n-ally-next-reviews.yml
```

## Backward Compatibility

i18n Ally Next maintains backward compatibility with some legacy settings:

- **`vue-i18n-ally.*`** settings are still read (but deprecated)
- **`i18n-ally.*`** settings are also detected and migrated
- The extension will automatically read from legacy namespaces if the new namespace is not configured

The migration command handles both legacy namespaces (`i18n-ally` and `vue-i18n-ally`) with `i18n-ally` taking priority when the same key exists in both.

## Uninstall i18n-ally

After migration, you can safely uninstall the original i18n-ally extension to avoid conflicts:

1. Open Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for "i18n Ally" (the original one)
3. Click **Uninstall**

## Troubleshooting

### Migration Command Not Found

Make sure you have installed **i18n Ally Next** (publisher: `lydanne`), not the original i18n-ally.

### Settings Not Applied

If settings don't seem to apply after migration:

1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check that no duplicate settings exist in both namespaces

### Custom Framework Not Working

Verify the file was renamed correctly and the content is valid YAML:

```bash
cat .vscode/i18n-ally-next-custom-framework.yml
```
