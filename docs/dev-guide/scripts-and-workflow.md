# Scripts & Development Workflow

## Scripts Overview

### Development

| Command | Description |
| --- | --- |
| `pnpm dev` | Start both main extension and Webview editor in watch mode |
| `pnpm main:dev` | Start main extension Webpack watch mode only |
| `pnpm editor:dev` | Start Webview editor Vite watch mode only |
| `pnpm i18n:dev` | Watch `locales/` directory changes, auto-recompile plugin's own i18n files |

### Build

| Command | Description |
| --- | --- |
| `pnpm build` | Full build: clean dist → compile i18n → Webpack bundle → Vite build Webview → post-process |
| `pnpm main:build` | Webpack bundle main extension only, outputs `extension.js` |
| `pnpm editor:build` | Vite build Webview editor only, outputs to `res/editor/` |
| `pnpm i18n:build` | Compile plugin's own i18n translation files |
| `pnpm vsce:pack` | Full build + package as `.vsix` file |

### Testing

| Command | Description |
| --- | --- |
| `pnpm test` | Run unit tests (equivalent to `test:unit`) |
| `pnpm test:unit` | Run unit tests under `test/unit/` using ts-mocha |
| `pnpm test:update` | Run unit tests and update all snapshots |
| `pnpm test:e2e` | Run E2E tests under `test/e2e/` in real VS Code environment |
| `pnpm test:e2e:update` | Run E2E tests and update all snapshots |
| `pnpm test:fixture` | Run string extraction fixture integration tests (only runs reliably in GitHub Actions; may fail locally due to VS Code instance timing issues) |

### Release

| Command | Description |
| --- | --- |
| `pnpm release` | Full release flow: build → bump patch version → package vsix |
| `pnpm release:patch` | Bump patch version with standard-version and push tags |
| `pnpm release:minor` | Bump minor version with standard-version and push tags |

### Others

| Command | Description |
| --- | --- |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm docs:dev` | Start documentation site dev server |
| `pnpm docs:build` | Build documentation site |

## Daily Development Workflow

### 1. Start Development Environment

```bash
pnpm dev
```

Then press `F5` in VS Code to launch the Extension Development Host.

### 2. Test After Code Changes

```bash
pnpm test:unit

# If snapshot-related logic changed, update snapshots
pnpm test:update
```

### 3. Package and Install Locally

```bash
pnpm vsce:pack

# Install to current IDE
code --install-extension ./i18n-ally-next-*.vsix --force
```

### 4. Submitting a Pull Request

When submitting a PR, please ensure you use the provided Pull Request template and meet the following requirements:

1. **AI Assistance**: Clearly state the proportion of AI-generated/assisted code.
2. **Type**: Specify whether the PR is a `fix` (bug fix) or `feat` (new feature).
3. **Examples & Tests**:
   - If adding a new framework or feature, provide relevant examples and unit/e2e tests.
   - If fixing a bug, add a reproducible fixture in `examples/by-fixtures/issue-<n>` and a corresponding E2E test in `test/e2e/fixtures/issue-<n>`.
4. **Documentation**: Update the relevant documentation in `docs/` if your PR changes any user-facing features or developer guidelines.

### 5. GitHub AI Agents

We use a native GitHub Action AI Reviewer to automate and assist in the development workflow:

- **AI PR Reviewer**: Powered by `fluxninja/openai-pr-reviewer`, it automatically reviews all Pull Requests to ensure they meet our contribution guidelines. It checks for AI-assisted code proportion disclosure, PR types, necessary examples, tests, and documentation updates. Note: This requires the `OPENAI_API_KEY` repository secret to be configured.

### 6. Release a New Version

```bash
pnpm release
```

## Environment Variables

| Variable | Values | Description |
| --- | --- | --- |
| `I18N_ALLY_ENV` | `production` / `development` / `test` | Controls build mode and runtime behavior |
| `CHAI_JEST_SNAPSHOT_UPDATE_ALL` | `true` | When set, running tests will auto-update all snapshots |
