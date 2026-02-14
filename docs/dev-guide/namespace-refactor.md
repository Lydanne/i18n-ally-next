# Namespace Delimiter Refactoring

## Background

In a `flat` keystyle + `namespace` enabled scenario (e.g., i18next with `namespaceDelimiter: ":"`), user code has keys like `t("common.stackTrace")`, translation file path is `{locale}/translation.json`, and the file contains `"common.stackTrace": "Stack Trace"`.

**Original Problem**: Go to Definition could locate the translation file but could not locate the specific key position.

## Root Cause

The plugin internally **hardcoded `.`** when concatenating namespace with key (e.g., `translation.common.stackTrace`) instead of using the configured `namespaceDelimiter` (e.g., `:`). This caused:

1. `splitKeypath("translation.common.stackTrace")` splits into `['translation', 'common', 'stackTrace']`
2. Looks for `common` in the `translation` subtree, but in flat style the key is `"common.stackTrace"` as a whole
3. `getPathWithoutNamespace()` using `:` cannot match the `.`-concatenated keypath

## Solution: Unified namespaceDelimiter

> **All namespace-key concatenations use `Global.getNamespaceDelimiter()`, no more hardcoded `.`.**

When `namespaceDelimiter = ":"`, internal keypath becomes `translation:common.stackTrace`.

### Modifications

#### 1. `splitKeypath` — Aware of namespaceDelimiter

Split by delimiter first for namespace, then by `.` for the rest. So `translation:common.stackTrace` → `['translation', 'common', 'stackTrace']`.

#### 2. `updateLocalesTree` — Manual namespace subtree

Manually create namespace subtrees with delimiter for keypath concatenation, replacing `lodash.set`.

#### 3. `handleRegexMatch` — Use delimiter

Changed `${namespace}.${key}` to `${namespace}${delimiter}${key}`.

#### 4. `getTreeNodeByKey` — Flatten style at all levels

Not just at root level, so flat keys in namespace subtrees can be found.

#### 5. `getPathWithoutNamespace` — Remove `.` fallback

Only match with the configured delimiter, no fallback to `.`.

#### 6. Framework `rewriteKeys` — Preserve delimiter

Normalize other delimiters (e.g., `/`) to the primary delimiter, but don't convert to `.`.

#### 7. `hasExplicitNamespace` flag

Added to `RewriteKeyContext` to distinguish user-explicit namespace from auto-concatenated namespace. `rewriteKeys` only deduplicates when namespace is explicit.

#### 8. `definition.ts` — Use `getKeys()` instead of `getKey()`

`getKeys()` returns full keys with namespace prefix.

## Files Modified

| File | Modification |
| --- | --- |
| `src/utils/NodeHelper.ts` | `splitKeypath` aware of delimiter; `getPathWithoutNamespace` removes fallback |
| `src/utils/Regex.ts` | `handleRegexMatch` uses delimiter; passes `hasExplicitNamespace` |
| `src/core/loaders/Loader.ts` | `updateTree` adds `separator` param; `getTreeNodeByKey` flatten at all levels |
| `src/core/loaders/LocaleLoader.ts` | `updateLocalesTree` manually builds namespace subtree |
| `src/core/types.ts` | `RewriteKeyContext` adds `hasExplicitNamespace` |
| `src/editor/definition.ts` | Uses `getKeys()` |
| `src/editor/annotation.ts` | Uses delimiter for concatenation |
| `src/editor/reviewComments.ts` | Uses delimiter for concatenation |
| `src/frameworks/custom.ts` | `rewriteKeys` preserves delimiter |
| `src/frameworks/i18next.ts` | Same |
| `src/frameworks/react-i18next.ts` | Same |
| `src/frameworks/next-intl.ts` | Same |
| `src/frameworks/next-international.ts` | Same |
| `src/frameworks/next-translate.ts` | Adds `namespaceDelimiter`, preserves key |

## Lessons Learned

1. **Don't lose information in internal representations** — Converting `:` to `.` loses namespace boundary info
2. **Follow the complete data flow chain** — Any inconsistency in the chain causes functional issues
3. **Distinguish "explicit" from "automatic" behavior** — `hasExplicitNamespace` distinguishes user-explicit from auto-concatenated namespace
4. **Inline display working ≠ navigation working** — They use different key retrieval methods
