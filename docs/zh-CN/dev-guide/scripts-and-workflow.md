# Scripts 命令与开发工作流

## Scripts 命令一览

### 开发

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 同时启动主扩展和 Webview 编辑器的 watch 模式 |
| `pnpm main:dev` | 仅启动主扩展的 Webpack watch 模式 |
| `pnpm editor:dev` | 仅启动 Webview 编辑器的 Vite watch 模式 |
| `pnpm i18n:dev` | 监听 `locales/` 目录变化，自动重新编译插件自身的 i18n 文件 |

### 构建

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 完整构建：清理 dist → 编译 i18n → Webpack 打包 → Vite 构建 Webview → 后处理 |
| `pnpm main:build` | 仅 Webpack 打包主扩展，输出 `extension.js` |
| `pnpm editor:build` | 仅 Vite 构建 Webview 编辑器，输出到 `res/editor/` |
| `pnpm i18n:build` | 编译插件自身的 i18n 翻译文件 |
| `pnpm vsce:pack` | 完整构建 + 打包为 `.vsix` 文件 |

### 测试

| 命令 | 说明 |
| --- | --- |
| `pnpm test` | 运行单元测试（等同于 `test:unit`） |
| `pnpm test:unit` | 使用 ts-mocha 运行 `test/unit/` 下的单元测试 |
| `pnpm test:update` | 运行单元测试并更新所有 snapshot |
| `pnpm test:e2e` | 在真实 VS Code 环境中运行 `test/e2e/` 下的 E2E 测试 |
| `pnpm test:e2e:update` | 运行 E2E 测试并更新所有 snapshot |
| `pnpm test:fixture` | 运行字符串提取的 fixture 集成测试（仅在 GitHub Actions 中可靠运行，本地环境可能因 VS Code 实例时序问题失败） |

### 发布

| 命令 | 说明 |
| --- | --- |
| `pnpm release` | 完整发布流程：构建 → patch 版本号 → 打包 vsix |
| `pnpm release:patch` | 使用 standard-version 递增 patch 版本并推送 tag |
| `pnpm release:minor` | 使用 standard-version 递增 minor 版本并推送 tag |

### 其他

| 命令 | 说明 |
| --- | --- |
| `pnpm lint` | ESLint 检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm docs:dev` | 启动文档站点开发服务器 |
| `pnpm docs:build` | 构建文档站点 |

## 日常开发工作流

### 1. 启动开发环境

```bash
pnpm dev
```

然后在 VS Code 中按 `F5` 启动扩展调试宿主（Extension Development Host）。

### 2. 修改代码后测试

```bash
pnpm test:unit

# 如果修改了 snapshot 相关逻辑，更新 snapshot
pnpm test:update
```

### 3. 打包并本地安装测试

```bash
pnpm vsce:pack

# 安装到当前 IDE
code --install-extension ./i18n-ally-next-*.vsix --force
```

### 4. 发布新版本

```bash
pnpm release
```

## 环境变量

| 变量 | 值 | 说明 |
| --- | --- | --- |
| `I18N_ALLY_ENV` | `production` / `development` / `test` | 控制构建模式和运行时行为 |
| `CHAI_JEST_SNAPSHOT_UPDATE_ALL` | `true` | 设置后运行测试时自动更新所有 snapshot |
