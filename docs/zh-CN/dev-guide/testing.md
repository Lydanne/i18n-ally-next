# 测试体系

## 测试分层

```text
┌──────────────────────────────────────────────────┐
│  Fixture 测试（字符串提取集成测试）                │  pnpm test:fixture
├──────────────────────────────────────────────────┤
│  E2E 测试（在真实 VS Code 中端到端验证）           │  pnpm test:e2e
├──────────────────────────────────────────────────┤
│  单元测试（纯逻辑测试，不依赖 VS Code）            │  pnpm test:unit
└──────────────────────────────────────────────────┘
```

## 单元测试（`test/unit/`）

```bash
pnpm test:unit        # 运行所有单元测试
pnpm test:update      # 运行并更新所有 snapshot
```

**技术栈**：ts-mocha + chai + chai-jest-snapshot

由于单元测试**不能依赖 VS Code 模块**，需要将核心逻辑复制到测试文件中，使用 mock 变量模拟全局状态。参考 `test/unit/translators/editorLLM.test.ts` 中的模式。

```text
test/unit/
├── setup.ts                    # 测试初始化
├── commands/                   # 命令相关测试
├── utils/                      # 工具函数测试
│   ├── NodeHelper.test.ts      # splitKeypath、getPathWithoutNamespace
│   ├── Regex.test.ts           # findCallExpressionStart/End
│   ├── flat.test.ts            # flatten / unflatten
│   └── pathMatching.test.ts    # 路径匹配
├── extraction/                 # 字符串提取检测测试
└── translators/                # 翻译引擎测试
```

## E2E 测试（`test/e2e/`）

```bash
pnpm test:e2e         # 运行 E2E 测试
pnpm test:e2e:update  # 运行并更新所有 snapshot
```

使用 `@vscode/test-electron` 启动真实 VS Code 实例，加载 `examples/by-frameworks/` 下的示例项目，验证框架检测、key 解析、覆盖率等。

Snapshot 文件记录了覆盖率报告（`allKeys`、`translatedKeys`）和 key 检测结果（`getKeys()` 输出）。

::: warning
E2E 测试的 fixture 来自 `examples/by-frameworks/` 目录，修改示例项目会影响 E2E 测试结果。
:::

## Fixture 测试（`test/fixtures/`）

```bash
pnpm test:fixture
```

将 `test/fixtures/{framework}/{category}/{name}/input/` 复制到临时目录，在真实 VS Code 中打开并执行 `extract-hard-strings-batch`，然后对比结果与 `output/` 中的预期文件。

::: warning
Fixture 测试仅在 GitHub Actions 中可靠运行。本地环境下由于 VS Code 实例启动时序、资源竞争等问题，部分用例可能失败或被中断。如需验证提取功能，建议推送到 CI 中运行。
:::

## 最佳实践

1. **修改核心逻辑后** → `pnpm test:unit`（快速反馈）
2. **修改 key 解析逻辑后** → `pnpm test:e2e`（完整框架验证）
3. **修改提取功能后** → 推送到 CI 运行 `pnpm test:fixture`（本地不可靠）
4. **打包前** → `pnpm test:unit && pnpm vsce:pack`
5. **最终验证** → 在实际项目中安装 vsix，测试跳转和内联显示
