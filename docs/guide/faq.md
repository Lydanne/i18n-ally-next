# FAQ

## The extension is not working

1. Check if the extension is enabled — look for the i18n Ally icon in the activity bar
2. Ensure your project has a supported framework dependency in `package.json`
3. Verify `localesPaths` is correctly configured
4. Open the Output panel → select **i18n Ally Next** to see logs

## Annotations are not showing

- Check `i18n-ally-next.annotations` is `true`
- Ensure `displayLanguage` is set and the locale file exists
- Verify the file language ID is supported by the framework

## Keys are not detected in code

- Check if `usageMatchRegex` patterns match your code style
- Use `regex.usageMatchAppend` to add custom patterns
- Verify `regex.key` allows the characters in your keys (e.g. `:` for namespaces)

## Namespace is not working

1. Ensure your framework supports namespace (see [Namespace](/guide/namespace))
2. For i18next / react-i18next, namespace is auto-enabled
3. For other frameworks, set `"i18n-ally-next.namespace": true`
4. Verify your locale files follow the `{locale}/{namespace}.{ext}` structure
5. Check `dirStructure` is set to `"dir"` (not `"file"`)

## Locale files are not loaded

- Check `localesPaths` points to the correct directory
- Verify `pathMatcher` matches your file structure
- Check the Output panel for loading errors
- Ensure `ignoreFiles` doesn't exclude your locale files

## How to use with monorepo?

Set `localesPaths` with resource scope in each workspace folder:

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.localesPaths": ["packages/app/locales"]
}
```

## How to disable for a specific project?

```jsonc
{
  "i18n-ally-next.disabled": true
}
```

## Translation is not accurate

Machine translation quality depends on the engine. Tips:
- Use DeepL or OpenAI for better quality
- Enable `translate.saveAsCandidates` for human review
- Set `translate.promptSource` to verify source text before translating
