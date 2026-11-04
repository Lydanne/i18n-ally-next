import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createServer } from 'node:http'
import { inspect } from 'node:util'
import { expect } from 'chai'
import { requestOpenAITranslation } from '../../../src/translators/engines/openaiRequest'

describe('openAI translation requests', () => {
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
        requests.push({ path: req.url, body: JSON.parse(body), authorization: req.headers.authorization })
        res.writeHead(status, { 'Content-Type': 'application/json', ...(status === 307 ? { Location: '/redirected' } : {}) })
        res.end(JSON.stringify({ choices: [{ message: { content: 'Bonjour' } }] }))
      })
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    root = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })
  after(async () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())))
  it('sends a modern model without unsupported legacy parameters', async () => {
    const result = await requestOpenAITranslation(root, 'synthetic-key', 'gpt-6-sol', 'Translate.', 'Hello')
    expect(requests[0]).to.deep.equal({
      path: '/v1/chat/completions',
      authorization: 'Bearer synthetic-key',
      body: { model: 'gpt-6-sol', messages: [{ role: 'system', content: 'Translate.' }, { role: 'user', content: 'Hello' }] },
    })
    expect(result.data.choices[0].message.content).to.equal('Bonjour')
    expect(inspect(result, { depth: 10 })).not.to.include('synthetic-key')
  })
  it('redacts the key in errors and does not follow redirects', async () => {
    status = 307
    const previous = requests.length
    let error: unknown
    try {
      await requestOpenAITranslation(root, 'synthetic-key', 'gpt-6-sol', 'Translate.', 'Hello')
    }
    catch (caught) {
      error = caught
    }
    expect(requests.length).to.equal(previous + 1)
    expect(inspect(error, { depth: 10 })).to.include('HTTP 307').and.not.include('synthetic-key')
  })
})
