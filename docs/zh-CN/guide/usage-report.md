# 使用报告与键管理

i18n Ally Next 会分析翻译键在代码库中的使用情况，帮助你识别未使用的键、缺失的翻译，并维护整洁的 locale 文件结构。

## 使用报告

插件会扫描你的源代码，将所有翻译键分为三类：

### 活跃键

**同时存在于 locale 文件和代码引用中**的键。这些是健康的、正在使用的翻译。

### 闲置键

**存在于 locale 文件但代码中未引用**的键。这些可能是：

- 应该删除的废弃翻译
- 通过动态模式使用但静态分析未检测到的键
- 通过派生键规则引用的键（如复数后缀）

### 缺失键

**代码中引用但 locale 文件中不存在**的键。这些需要添加到翻译中。

## 查看报告

使用报告显示在 **i18n Ally 侧边栏**的树视图中。每个分类显示数量，并允许浏览单个键。

手动刷新报告：

- **命令面板** — 运行 `i18n Ally Next: Refresh Usage Report`
- **侧边栏** — 点击树视图标题中的刷新图标

## 键管理操作

### 复制键

将一个翻译键及其所有语言的值复制到新的键路径：

1. 在侧边栏树视图中右键点击一个键
2. 选择 **Duplicate Key**
3. 输入新的键路径
4. 所有 locale 值都会被复制到新路径

### 补全缺失键

为所有语言批量创建缺失的空键条目，方便后续填写翻译：

1. 从侧边栏进度视图运行——点击特定 locale 上的 **Fulfill** 按钮
2. 或从命令面板运行，为所有 locale 补全所有缺失键

```jsonc
{
  // 在 locale 文件中保留已补全的（空值）键
  "i18n-ally-next.keepFulfilled": true
}
```

### 标记为使用中

防止某个键被报告为闲置，手动标记为「使用中」：

1. 在侧边栏中右键点击一个键
2. 选择 **Mark as In Use**

该键会被添加到 `keysInUse` 配置中。此设置也支持 **glob 模式**来匹配多个键：

```jsonc
{
  "i18n-ally-next.keysInUse": [
    "common.ok",
    "errors.*",
    "validation.**"
  ]
}
```

### 派生键规则

某些框架会动态生成键（如复数形式：`item`、`item_one`、`item_other`）。配置派生键规则让插件理解这些关系：

```jsonc
{
  "i18n-ally-next.usage.derivedKeyRules": [
    "{key}_one",
    "{key}_other",
    "{key}_zero",
    "{key}_two",
    "{key}_few",
    "{key}_many"
  ]
}
```

当源键处于活跃状态时，其派生键不会被报告为闲置。

## 扫描配置

控制哪些文件被纳入使用分析扫描：

```jsonc
{
  // 使用扫描时忽略的 glob 模式
  "i18n-ally-next.usage.scanningIgnore": [
    "dist/**",
    "node_modules/**",
    "*.test.ts"
  ]
}
```
