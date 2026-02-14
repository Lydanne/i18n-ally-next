# Namespace Delimiter 重构经验

## 背景

在 `flat` keystyle + `namespace` 启用的场景下（如 i18next 配置 `namespaceDelimiter: ":"`），用户代码中的 key 形如 `t("common.stackTrace")`，翻译文件路径为 `{locale}/translation.json`，文件中 key 为 `"common.stackTrace": "堆栈信息"`。

**原始问题**：Go to Definition 可以定位到翻译文件，但无法定位到具体的 key 位置。

## 根因分析

插件内部在多个地方将 namespace 与 key 拼接时**硬编码使用 `.`**（如 `translation.common.stackTrace`），而非使用配置的 `namespaceDelimiter`（如 `:`）。这导致：

1. `splitKeypath("translation.common.stackTrace")` 拆分为 `['translation', 'common', 'stackTrace']`
2. 在 `translation` 子树中查找 `common`，但 flat 风格下 key 是 `"common.stackTrace"` 整体，不存在 `common` 子节点
3. `getPathWithoutNamespace()` 用 `:` 去除前缀时，无法匹配 `.` 拼接的 keypath

## 解决方案：统一使用 namespaceDelimiter

> **所有 namespace 与 key 的拼接都使用 `Global.getNamespaceDelimiter()`，不再硬编码 `.`。**

当 `namespaceDelimiter = ":"` 时，内部 keypath 为 `translation:common.stackTrace`。

### 修改点

#### 1. `splitKeypath` — 感知 namespaceDelimiter

先按 delimiter 拆出 namespace，再按 `.` 拆剩余部分。`translation:common.stackTrace` → `['translation', 'common', 'stackTrace']`。

#### 2. `updateLocalesTree` — 手动构建 namespace 子树

手动创建 namespace 子树，用 delimiter 拼接 keypath，替代 `lodash.set`。

#### 3. `handleRegexMatch` — 用 delimiter 拼接

`${namespace}.${key}` 改为 `${namespace}${delimiter}${key}`。

#### 4. `getTreeNodeByKey` — 所有层级尝试 flatten style 查找

不仅在 root 层级，namespace 子树中也能用 flatten style 查找完整 key。

#### 5. `getPathWithoutNamespace` — 去掉 `.` 回退

只用配置的 delimiter 匹配，不再回退到 `.`。

#### 6. 框架 `rewriteKeys` — 保留主 delimiter

把其他 delimiter（如 `/`）统一转为主 delimiter，但不再转成 `.`。

#### 7. `hasExplicitNamespace` 标志

添加到 `RewriteKeyContext`，区分"用户显式写的 namespace"和"系统自动拼接的 namespace"。`rewriteKeys` 只在显式 namespace 时才去重。

#### 8. `definition.ts` — 改用 `getKeys()` 替代 `getKey()`

`getKeys()` 返回带 namespace 的完整 key。

## 涉及的文件

| 文件 | 修改内容 |
| --- | --- |
| `src/utils/NodeHelper.ts` | `splitKeypath` 感知 delimiter；`getPathWithoutNamespace` 去掉回退 |
| `src/utils/Regex.ts` | `handleRegexMatch` 用 delimiter 拼接；传递 `hasExplicitNamespace` |
| `src/core/loaders/Loader.ts` | `updateTree` 添加 `separator` 参数；`getTreeNodeByKey` 全层级 flatten |
| `src/core/loaders/LocaleLoader.ts` | `updateLocalesTree` 手动构建 namespace 子树 |
| `src/core/types.ts` | `RewriteKeyContext` 添加 `hasExplicitNamespace` |
| `src/editor/definition.ts` | 改用 `getKeys()` |
| `src/editor/annotation.ts` | 用 delimiter 拼接 |
| `src/editor/reviewComments.ts` | 用 delimiter 拼接 |
| `src/frameworks/custom.ts` | `rewriteKeys` 保留 delimiter |
| `src/frameworks/i18next.ts` | 同上 |
| `src/frameworks/react-i18next.ts` | 同上 |
| `src/frameworks/next-intl.ts` | 同上 |
| `src/frameworks/next-international.ts` | 同上 |
| `src/frameworks/next-translate.ts` | 添加 `namespaceDelimiter`，保留 key |

## 经验教训

1. **不要在内部表示中丢失信息** — 将 `:` 转为 `.` 会丢失 namespace 边界信息
2. **关注数据流的完整链路** — 任何一个环节的不一致都会导致功能异常
3. **区分"显式"与"自动"行为** — `hasExplicitNamespace` 区分用户显式 namespace 和系统自动拼接
4. **内联显示正常 ≠ 跳转正常** — 它们使用不同的 key 获取方式，需要分别验证
