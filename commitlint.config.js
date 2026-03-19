module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 必须是以下之一
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // 修复 bug
      'docs',     // 文档更新
      'style',    // 代码格式（不影响功能）
      'refactor', // 重构
      'perf',     // 性能优化
      'test',     // 测试相关
      'build',    // 构建相关
      'ci',       // CI 配置
      'chore',    // 其他杂项
      'revert',   // 回滚
    ]],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
    // 允许 subject 首字母大写（Copilot 生成的 commit 常用大写）
    'subject-case': [0],
    // 放宽 body 行长度限制
    'body-max-line-length': [0],
  },
}
