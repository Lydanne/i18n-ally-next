const { spawnSync } = require('node:child_process')

function releaseArguments(tag) {
  if (typeof tag !== 'string' || !/^v[^\0\r\n]+$/.test(tag))
    throw new Error('GITHUB_REF_NAME must be a version tag starting with v')
  return ['release', 'create', tag, '--verify-tag', '--generate-notes']
}

if (require.main === module) {
  const args = releaseArguments(process.env.GITHUB_REF_NAME)
  const result = spawnSync('gh', args, { stdio: 'inherit' })
  if (result.error)
    throw result.error
  process.exitCode = result.status ?? 1
}

module.exports = { releaseArguments }
