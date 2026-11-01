import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { expect } from 'chai'

// eslint-disable-next-line ts/no-require-imports
const { releaseArguments } = require('../../../scripts/create-github-release.cjs')

describe('release command', () => {
  it('validates the tag and passes it as a single argument', () => {
    expect(releaseArguments('v1.2.3+build')).to.deep.equal(['release', 'create', 'v1.2.3+build', '--verify-tag', '--generate-notes'])
    for (const tag of [undefined, '', '--help', 'v', 'v1\n--help'])
      expect(() => releaseArguments(tag)).to.throw()
  })

  it('invokes gh without publishing during the test', function () {
    if (process.platform === 'win32')
      this.skip()
    const directory = mkdtempSync(path.join(os.tmpdir(), 'release-command-'))
    try {
      const capture = path.join(directory, 'args')
      const fakeGh = path.join(directory, 'gh')
      writeFileSync(fakeGh, '#!/bin/sh\nprintf "%s\\n" "$@" > "$CAPTURE_FILE"\n')
      chmodSync(fakeGh, 0o755)
      const result = spawnSync(process.execPath, [path.resolve('scripts/create-github-release.cjs')], {
        env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}`, GITHUB_REF_NAME: 'v1.2.3', CAPTURE_FILE: capture },
        encoding: 'utf8',
      })
      expect(result.status, result.stderr).to.equal(0)
      expect(readFileSync(capture, 'utf8').trim().split('\n')).to.deep.equal(['release', 'create', 'v1.2.3', '--verify-tag', '--generate-notes'])
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
