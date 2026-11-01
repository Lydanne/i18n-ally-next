const { getOIDCCredential } = require('@vscode/vsce/out/oidc')
const { publisher } = require('../package.json')

// Obtain and discard a short-lived credential before either registry is changed.
// vsce requests a fresh single-use GitHub OIDC token again when publishing.
async function verify(getCredential = getOIDCCredential) {
  await getCredential(publisher)
}

if (require.main === module) {
  verify().then(
    () => console.log('Marketplace trusted publishing is authorized'),
    () => {
      console.error('Marketplace OIDC authorization failed; verify the trusted publishing policy for this repository and workflow')
      process.exitCode = 1
    },
  )
}
module.exports = { verify }
