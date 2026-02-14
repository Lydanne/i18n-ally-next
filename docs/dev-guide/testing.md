# Testing System

## Test Layers

```text
┌──────────────────────────────────────────────────┐
│  Fixture Tests (string extraction integration)    │  pnpm test:fixture
├──────────────────────────────────────────────────┤
│  E2E Tests (end-to-end in real VS Code)           │  pnpm test:e2e
├──────────────────────────────────────────────────┤
│  Unit Tests (pure logic, no VS Code dependency)   │  pnpm test:unit
└──────────────────────────────────────────────────┘
```

## Unit Tests (`test/unit/`)

```bash
pnpm test:unit        # Run all unit tests
pnpm test:update      # Run and update all snapshots
```

**Tech stack**: ts-mocha + chai + chai-jest-snapshot

Since unit tests **cannot depend on VS Code modules**, you need to copy core logic into test files and use mock variables. See `test/unit/translators/editorLLM.test.ts` for the pattern.

```text
test/unit/
├── setup.ts                    # Test initialization
├── commands/                   # Command tests
├── utils/                      # Utility function tests
│   ├── NodeHelper.test.ts      # splitKeypath, getPathWithoutNamespace
│   ├── Regex.test.ts           # findCallExpressionStart/End
│   ├── flat.test.ts            # flatten / unflatten
│   └── pathMatching.test.ts    # Path matching
├── extraction/                 # String extraction detection tests
└── translators/                # Translation engine tests
```

## E2E Tests (`test/e2e/`)

```bash
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:update  # Run and update all snapshots
```

Uses `@vscode/test-electron` to launch a real VS Code instance, loads example projects from `examples/by-frameworks/` as workspace, and verifies framework detection, key parsing, coverage.

Snapshot files record coverage reports (`allKeys`, `translatedKeys`) and key detection results (`getKeys()` output).

::: warning
E2E test fixtures come from `examples/by-frameworks/`. Modifying example projects will affect E2E test results.
:::

## Fixture Tests (`test/fixtures/`)

```bash
pnpm test:fixture
```

Copies `test/fixtures/{framework}/{category}/{name}/input/` to a temp directory, opens in real VS Code, executes `extract-hard-strings-batch`, and compares results with `output/`.

::: warning
Fixture tests only run reliably in GitHub Actions. Locally, they may fail or get interrupted due to VS Code instance startup timing and resource contention issues. To verify extraction functionality, push to CI.
:::

## Best Practices

1. **After modifying core logic** → `pnpm test:unit` (fast feedback)
2. **After modifying key parsing** → `pnpm test:e2e` (full framework verification)
3. **After modifying extraction** → Push to CI to run `pnpm test:fixture` (unreliable locally)
4. **Before packaging** → `pnpm test:unit && pnpm vsce:pack`
5. **Final verification** → Install vsix in real project, test navigation and inline display
