# Copilot Instructions

## Commit Message 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 格式

```
<type>(<scope>): <subject>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建相关
- `ci`: CI 配置
- `chore`: 其他杂项
- `revert`: 回滚

### Scope 范围（可选）

常用 scope：
- `transloco`, `i18next`, `vue-i18n` 等框架名
- `loader`, `editor`, `completion` 等模块名

### 示例

```
fix(transloco): fix kebab-case namespace key recognition
feat(editor): add autocomplete for namespace delimiter
test(i18next): add e2e test for explicit namespace
docs: update README with new configuration options
```

### 注意事项

1. **type 和 subject 必填**，scope 可选
2. **subject 使用小写开头**，不要以句号结尾
3. **使用英文**编写 commit message
4. 修复 issue 时在 body 或 footer 中添加 `closes #issue-number`

## 代码规范

- 使用 TypeScript，声明所有类型
- 函数保持简短（<20 行）
- 使用 early return 避免深层嵌套
- 使用 JSDoc 注释公共类和方法
