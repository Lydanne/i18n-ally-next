import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect } from 'chai'

describe('native dependency installer', () => {
  it('installs a locally supplied archive with the upgraded node-pre-gyp', async function () {
    // node-pre-gyp's local file URL handling does not support Windows drive paths.
    if (process.platform === 'win32')
      this.skip()
    const root = mkdtempSync(path.join(os.tmpdir(), 'i18n-native-installer-'))
    try {
      const nodejieba = require.resolve('nodejieba/package.json', { paths: [require.resolve('limax')] })
      const preGyp = createRequire(nodejieba).resolve('@mapbox/node-pre-gyp/package.json')
      const requirePreGyp = createRequire(preGyp)
      const tar = requirePreGyp('tar')
      const archiveRoot = path.join(root, 'archive')
      const project = path.join(root, 'project')
      mkdirSync(path.join(archiveRoot, 'package'), { recursive: true })
      mkdirSync(project)
      writeFileSync(path.join(archiveRoot, 'package', 'addon.node'), 'fixture binary')
      await tar.create({ cwd: archiveRoot, gzip: true, file: path.join(root, 'addon.tgz') }, ['package'])
      writeFileSync(path.join(project, 'package.json'), JSON.stringify({
        name: 'test-addon',
        version: '1.0.0',
        main: 'index.js',
        binary: { module_name: 'addon', module_path: './build/Release', host: pathToFileURL(`${root}${path.sep}`).href, package_name: 'addon.tgz' },
      }))
      const result = spawnSync(process.execPath, [path.join(path.dirname(preGyp), 'bin/node-pre-gyp'), 'install', '--fallback-to-build=false'], { cwd: project, encoding: 'utf8' })
      expect(result.status, result.stderr).to.equal(0)
      expect(readFileSync(path.join(project, 'build/Release/addon.node'), 'utf8')).to.equal('fixture binary')
      expect(requirePreGyp('tar/package.json').version).to.match(/^7\./)
    }
    finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
