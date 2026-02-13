# 审阅系统

i18n Ally Next 内置翻译审阅和协作系统，基于 VS Code 原生的评论 API。

## 启用 / 禁用

```jsonc
// .vscode/settings.json
{
  "i18n-ally-next.review.enabled": true,
  "i18n-ally-next.review.gutters": true
}
```

## 工作方式

1. 打开语言文件（JSON / YAML）
2. 行号旁的图标指示每个键的审阅状态
3. 点击图标打开评论线程
4. 留下评论、批准或请求修改

## 审阅操作

- **批准** — 标记翻译为已批准
- **请求修改** — 标记翻译需要修订
- **评论** — 留下一般性评论
- **解决** — 标记评论线程为已解决

## 审阅数据

审阅数据存储在项目的 `.vscode/i18n-ally-next-reviews.yml` 文件中。该文件可以提交到版本控制系统，方便团队协作。

## 用户身份

审阅者的姓名和邮箱会自动从 Git 配置中获取。你也可以手动覆盖：

```jsonc
{
  "i18n-ally-next.review.user.name": "你的名字",
  "i18n-ally-next.review.user.email": "you@example.com"
}
```

## 翻译候选

启用 `translate.saveAsCandidates` 后，机器翻译会保存为候选项而不是直接应用。团队成员可以审阅后再批准。

```jsonc
{
  "i18n-ally-next.translate.saveAsCandidates": true
}
```
