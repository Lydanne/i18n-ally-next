// Stage the executable and its dependency tree as real files: VSIX packages
// do not preserve pnpm's node_modules symlinks when using --no-dependencies.
const fs = require('node:fs')
const { createRequire } = require('node:module')
const path = require('node:path')

const destination = path.resolve('dist/ts-parser/node_modules')
fs.rmSync(destination, { recursive: true, force: true })

function copyPackage(name, resolveFrom, targetModules, ancestors = new Set()) {
  const packageFile = createRequire(resolveFrom).resolve(`${name}/package.json`)
  const source = fs.realpathSync(path.dirname(packageFile))
  const target = path.join(targetModules, name)
  if (ancestors.has(source))
    throw new Error(`Circular runtime dependency: ${name}`)
  fs.cpSync(source, target, { recursive: true, dereference: true, filter: p => path.basename(p) !== 'node_modules' })
  const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
  const next = new Set([...ancestors, source])
  for (const dependency of Object.keys(manifest.dependencies || {}))
    copyPackage(dependency, packageFile, path.join(target, 'node_modules'), next)
}

const root = path.resolve('package.json')
copyPackage('ts-node', root, destination)
copyPackage('typescript', root, destination)
