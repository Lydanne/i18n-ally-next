// Smoke-test the actual VSIX without the development node_modules on its path.
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const vsix = process.argv[2]
if (!vsix)
  throw new Error('Pass the path to the VSIX')
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n ally vsix '))
try {
  execFileSync('unzip', ['-q', path.resolve(vsix), '-d', temp])
  const project = path.join(temp, 'project')
  fs.mkdirSync(project)
  const locale = path.join(project, 'en.ts')
  fs.writeFileSync(locale, 'export default { greeting: "hello" }\n')
  const extension = path.join(temp, 'extension')
  const output = execFileSync(process.execPath, [
    path.join(extension, 'dist/ts-parser/node_modules/ts-node/dist/bin.js'),
    '--dir',
    project,
    '--transpile-only',
    '--compiler-options',
    JSON.stringify({ importHelpers: false, allowJs: true, module: 'commonjs' }),
    path.join(extension, 'assets/loader.js'),
    locale,
  ], { cwd: project, encoding: 'utf8' })
  if (JSON.parse(output).greeting !== 'hello')
    throw new Error(`Unexpected locale output: ${output}`)
}
finally {
  fs.rmSync(temp, { recursive: true, force: true })
}
