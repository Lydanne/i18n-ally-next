# FAQ & Debugging Tips

## Debugging Methods

### Extension Development Host

Press `F5` in VS Code to launch the Extension Development Host. Set breakpoints, view Debug Console logs, and reload with `Ctrl+Shift+P` → `Developer: Reload Window`.

### Output Channel

The plugin outputs logs in VS Code's Output panel under the `i18n Ally Next` channel.

```typescript
import { Log } from '~/utils'

Log.info('Current key:', key)
Log.warn('Node not found:', keypath)
```

### Quick Package and Verify

```bash
pnpm vsce:pack
code --install-extension ./i18n-ally-next-*.vsix --force
```

## FAQ

### Inline display works but Go to Definition fails

- `annotation.ts` uses `KeyDetector.getUsages()` → `getKeys()` (with namespace)
- `definition.ts` must also use `getKeys()` (not `getKey()` which lacks namespace)
- Check: `getFilepathByKey(key)` finds file → `getPathWithoutNamespace(key)` strips prefix → `parser.navigateToKey()` locates key

### Keys not detected after adding a new framework

- Verify `usageMatchRegex` matches source code key calls
- Verify `detection` rules detect the framework via package.json
- Verify `rewriteKeys()` doesn't accidentally lose namespace info

### Key lookup fails in flat keystyle + namespace

- Flat keys are full paths (e.g., `"common.stackTrace"`)
- `getTreeNodeByKey` must try flatten style lookup in namespace subtrees
- `splitKeypath` must distinguish namespace delimiter (`:`) from key path delimiter (`.`)

### `rewriteKeys` unexpectedly modifies keys

- `rewriteKeys` runs after `handleRegexMatch` which may have auto-concatenated namespace
- Use `context.hasExplicitNamespace` to only deduplicate when namespace is explicit

### E2E test snapshots don't match

```bash
pnpm test:e2e:update  # Review diffs first, then update
```

## Development Checklist

When modifying key detection/concatenation/lookup/navigation, verify:

- [ ] No namespace scenario (`namespace: false`)
- [ ] Namespace + nested keystyle
- [ ] Namespace + flat keystyle
- [ ] With `defaultNamespace`
- [ ] With scope (e.g., `useTranslation("ns")`)
- [ ] Explicit namespace (e.g., `t("ns:key")`)
- [ ] Multiple namespace delimiters (`:`, `/`)

## Adding a New Framework

1. Create file under `src/frameworks/`, extend `Framework` base class
2. Define `id`, `display`, `detection`, `usageMatchRegex`
3. Register in `src/frameworks/index.ts`
4. Create example project under `examples/by-frameworks/`
5. Add E2E tests (optional)

## Path Aliases

The project uses `~` as path alias pointing to `src/`:

```typescript
import { Config } from '~/core'  // → src/core/index.ts
```

Configured in both `tsconfig.json` and `webpack.config.js`.
