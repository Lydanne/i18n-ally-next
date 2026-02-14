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

### 4. Release a New Version

```bash
pnpm release
```

## Environment Variables

| Variable | Values | Description |
| --- | --- | --- |
| `I18N_ALLY_ENV` | `production` / `development` / `test` | Controls build mode and runtime behavior |
| `CHAI_JEST_SNAPSHOT_UPDATE_ALL` | `true` | When set, running tests will auto-update all snapshots |
