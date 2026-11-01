import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createServer } from 'node:http'
import { inspect } from 'node:util'
import { expect } from 'chai'
import { requestLibreTranslation } from '../../../src/translators/engines/libretranslateRequest'

describe('libreTranslate requests', () => {
  let server: Server
  let root: string
  let requests: any[]
  let status: number
  before(async () => {
    requests = []
    status = 200
    server = createServer((req, res) => {
      let body = ''
      req.setEncoding('utf8')
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        requests.push(JSON.parse(body))
        res.writeHead(status, { 'Content-Type': 'application/json', ...(status === 307 ? { Location: '/redirected' } : {}) })
        res.end(JSON.stringify({ translatedText: 'Bonjour' }))
      })
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    root = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })
  after(async () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())))
  it('sends the key only when configured', async () => {
    await requestLibreTranslation(root, 'Hello', 'en', 'fr')
    await requestLibreTranslation(root, 'Hello', 'en', 'fr', 'test-secret')
    expect(requests[0]).not.to.have.property('api_key')
    expect(requests[1].api_key).to.equal('test-secret')
  })
  it('does not expose credentials in a logged request failure', async () => {
    status = 403
    let error: unknown
    try {
      await requestLibreTranslation(root, 'Hello', 'en', 'fr', 'test-secret')
    }
    catch (caught) {
      error = caught
    }
    expect(error).to.be.instanceOf(Error)
    expect(inspect(error, { depth: 10 })).to.include('HTTP 403').and.not.include('test-secret')
    expect(error).not.to.have.property('config')
  })
  it('does not forward a credential on redirect', async () => {
    status = 307
    const previous = requests.length
    try {
      await requestLibreTranslation(root, 'Hello', 'en', 'fr', 'test-secret')
    }
    catch {}
    expect(requests.length).to.equal(previous + 1)
  })
})
