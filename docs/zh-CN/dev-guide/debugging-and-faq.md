# 常见问题与调试技巧

## 调试方法

### 使用 Extension Development Host 调试

在 VS Code 中按 `F5` 启动扩展调试宿主，可以设置断点、查看 Debug Console 日志、修改代码后通过 `Ctrl+Shift+P` → `Developer: Reload Window` 重新加载。

### 使用 Output Channel 查看日志

插件会在 VS Code 的 Output 面板中输出日志，选择 `i18n Ally Next` 频道查看。

```typescript
import { Log } from '~/utils'

Log.info('当前 key:', key)
Log.warn('未找到节点:', keypath)
```

### 快速打包验证

```bash
pnpm vsce:pack
code --install-extension ./i18n-ally-next-*.vsix --force
```

## 常见问题

### 内联显示正常但跳转定义失败

- `annotation.ts` 使用 `KeyDetector.getUsages()` → `getKeys()`（带 namespace）
- `definition.ts` 也必须使用 `getKeys()`（而非 `getKey()`，后者不含 namespace）
- 排查：`getFilepathByKey(key)` 找到文件 → `getPathWithoutNamespace(key)` 去掉前缀 → `parser.navigateToKey()` 定位 key

### 新增框架后 key 检测不到

- 确认 `usageMatchRegex` 正则是否正确匹配源码中的 key 调用
- 确认 `detection` 规则是否正确检测到框架（通过 package.json 依赖）
- 确认 `rewriteKeys()` 是否正确处理 key（不要意外丢失 namespace 信息）

### flat keystyle + namespace 场景下 key 查找失败

- flat 风格下 key 是完整路径（如 `"common.stackTrace"`）
- `getTreeNodeByKey` 需要在 namespace 子树中用 flatten style 查找完整 key
- `splitKeypath` 需要正确区分 namespace 分隔符（`:`）和 key 路径分隔符（`.`）

### `rewriteKeys` 导致 key 被意外修改

- `rewriteKeys` 在 `handleRegexMatch` 之后调用，此时 key 可能已经被拼接了 namespace 前缀
- 通过 `context.hasExplicitNamespace` 区分显式和自动拼接的 namespace
- 只在 `hasExplicitNamespace === true` 时才去重 namespace 前缀

### E2E 测试 snapshot 不匹配

```bash
pnpm test:e2e:update  # 先审查差异，确认是预期行为后再更新
```

## 开发检查清单

修改 key 检测/拼接/查找/跳转逻辑时，需要验证以下场景：

- [ ] 无 namespace 场景（`namespace: false`）
- [ ] 有 namespace + nested keystyle
- [ ] 有 namespace + flat keystyle
- [ ] 有 `defaultNamespace` 的场景
- [ ] 有 scope（如 `useTranslation("ns")`）的场景
- [ ] 显式 namespace（如 `t("ns:key")`）的场景
- [ ] 多种 namespace delimiter（`:`、`/`）的场景

## 添加新框架的步骤

1. 在 `src/frameworks/` 下创建新文件，继承 `Framework` 基类
2. 定义 `id`、`display`、`detection`、`usageMatchRegex` 等属性
3. 在 `src/frameworks/index.ts` 中注册
4. 在 `examples/by-frameworks/` 下创建示例项目
5. 添加 E2E 测试（可选）

## 路径别名

项目使用 `~` 作为路径别名指向 `src/` 目录：

```typescript
import { Config } from '~/core'  // → src/core/index.ts
```

该别名在 `tsconfig.json` 和 `webpack.config.js` 中同时配置。
