import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'out/',
    'dist/',
    'examples/',
    '.cache/',
    'res/',
    'test-resources/',
    'test/e2e-out/',
    'test/e2e-fixtures-temp/',
    'test/fixture-scripts-out/',
    'test/fixtures/',
    'test/fixtures-temp/',
    'assets/',
  ],
  rules: {
    'ts/ban-ts-comment': 'off',
    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
    'unused-imports/no-unused-vars': 'warn',
    'regexp/no-super-linear-backtracking': 'warn',
    'no-restricted-syntax': 'off',
    'no-console': 'warn',
    'no-control-regex': 'off',
    'regexp/no-escape-backspace': 'off',
    'style/max-statements-per-line': 'off',
  },
})
