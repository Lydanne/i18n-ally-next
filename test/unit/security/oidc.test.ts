import { expect } from 'chai'
// eslint-disable-next-line perfectionist/sort-imports, ts/no-require-imports
const { getOIDCCredential } = require('@vscode/vsce/out/oidc')
// eslint-disable-next-line ts/no-require-imports
const { verify } = require('../../../scripts/check-marketplace-oidc.cjs')

describe('marketplace OIDC preflight', () => {
  it('verifies the configured publisher and does not return the credential', async () => {
    let publisher = ''
    const result = await verify(async (value: string) => {
      publisher = value
      return 'fixture-secret'
    })
    expect(publisher).to.equal('lydanne')
    expect(result).to.equal(undefined)
  })

  it('propagates a failed exchange so publishing cannot start', async () => {
    try {
      await verify(async () => { throw new Error('denied') })
      expect.fail('expected the exchange to fail')
    }
    catch (error) {
      expect((error as Error).message).to.equal('denied')
    }
  })

  it('exchanges a GitHub token for the configured Marketplace publisher', async () => {
    const requests: Array<{ url: string, init: any }> = []
    const credential = await getOIDCCredential('lydanne', {
      environment: { GITHUB_ACTIONS: 'true', ACTIONS_ID_TOKEN_REQUEST_URL: 'https://actions.invalid/token', ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'fixture-request-token' },
      marketplaceUrl: 'https://marketplace.invalid',
      request: async (url: string, init: any) => {
        requests.push({ url, init })
        const response = requests.length === 1 ? { value: 'fixture-jwt' } : { credential: 'fixture-session' }
        return { statusCode: 200, readBody: async () => JSON.stringify(response) }
      },
    })
    expect(credential).to.equal('fixture-session')
    expect(new URL(requests[0].url).searchParams.get('audience')).to.equal('marketplace.visualstudio.com')
    expect(requests[1].init.headers.Authorization).to.equal('FederatedToken fixture-jwt')
    expect(JSON.parse(requests[1].init.body)).to.deep.equal({ publisherName: 'lydanne' })
  })
})
