# 从 i18n-ally 迁移

如果你正在从原版 **i18n-ally** 扩展迁移到 **i18n-ally-next**，本指南将帮助你转移现有配置。

## 自动迁移

i18n Ally Next 提供了内置的迁移命令，可以自动转移你的配置。

### 运行迁移命令

1. 打开命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. 搜索 **"i18n Ally Next: 从 i18n-ally 迁移"**
3. 查看迁移摘要并确认

### 迁移内容

迁移命令会处理以下内容：

| 项目 | 原位置 | 新位置 |
| ---- | ------ | ------ |
| **工作区设置** | `i18n-ally.*` / `vue-i18n-ally.*` | `i18n-ally-next.*` |
| **全局设置** | `i18n-ally.*` / `vue-i18n-ally.*` | `i18n-ally-next.*` |
| **自定义框架** | `.vscode/i18n-ally-custom-framework.yml` | `.vscode/i18n-ally-next-custom-framework.yml` |
| **审阅文件** | `.vscode/i18n-ally-reviews.yml` | `.vscode/i18n-ally-next-reviews.yml` |

## 手动迁移

如果你更喜欢手动迁移，请按以下步骤操作：

### 1. 更新设置

在 `.vscode/settings.json` 中，将所有 `i18n-ally.*` 或 `vue-i18n-ally.*` 设置重命名为 `i18n-ally-next.*`：

```diff
{
-  "i18n-ally.localesPaths": ["src/locales"],
-  "i18n-ally.sourceLanguage": "en",
-  "i18n-ally.displayLanguage": "zh-CN"
+  "i18n-ally-next.localesPaths": ["src/locales"],
+  "i18n-ally-next.sourceLanguage": "en",
+  "i18n-ally-next.displayLanguage": "zh-CN"
}
```

同时检查你的全局（用户级别）设置（`Ctrl+Shift+P` → “Preferences: Open User Settings (JSON)”），将其中的 `i18n-ally.*` 或 `vue-i18n-ally.*` 条目也进行重命名。

### 2. 重命名自定义框架文件

如果你有自定义框架配置：

```bash
mv .vscode/i18n-ally-custom-framework.yml .vscode/i18n-ally-next-custom-framework.yml
```

### 3. 重命名审阅文件

如果你使用审阅功能：

```bash
mv .vscode/i18n-ally-reviews.yml .vscode/i18n-ally-next-reviews.yml
```

## 向后兼容

i18n Ally Next 保持了对部分旧版设置的向后兼容：

- **`vue-i18n-ally.*`** 设置仍会被读取（但已弃用）
- **`i18n-ally.*`** 设置也会被检测并迁移
- 如果新命名空间未配置，扩展会自动从旧命名空间读取

迁移命令会同时处理两个旧版命名空间（`i18n-ally` 和 `vue-i18n-ally`），当同一个 key 在两者中都存在时，`i18n-ally` 的值优先。

## 卸载 i18n-ally

迁移完成后，你可以安全地卸载原版 i18n-ally 扩展以避免冲突：

1. 打开扩展面板 (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. 搜索 "i18n Ally"（原版）
3. 点击 **卸载**

## 故障排除

### 找不到迁移命令

确保你安装的是 **i18n Ally Next**（发布者：`lydanne`），而不是原版 i18n-ally。

### 设置未生效

如果迁移后设置似乎没有生效：

1. 重新加载 VS Code 窗口（`Ctrl+Shift+P` → "Developer: Reload Window"）
2. 检查两个命名空间中是否存在重复设置

### 自定义框架不工作

验证文件是否正确重命名，且内容是有效的 YAML：

```bash
cat .vscode/i18n-ally-next-custom-framework.yml
```
