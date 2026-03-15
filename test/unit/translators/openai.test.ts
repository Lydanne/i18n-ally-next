import { expect } from 'chai'

/**
 * OpenAI 翻译引擎纯函数测试
 * 测试 transform 方法的响应解析和错误处理逻辑
 */

interface TranslateOptions {
  text: string
  from?: string
  to?: string
}

interface TranslateResult {
  text: string
  from: string
  to: string
  response: any
  linkToResult: string
  error?: Error
  result?: string[]
}

// Copy the transform logic for testing (avoids vscode module dependency)
function transform(response: any, options: TranslateOptions): TranslateResult {
  const { text, from = 'auto', to = 'auto' } = options

  const choices = response.data?.choices
  if (!choices || choices.length === 0)
    throw new Error(`Unexpected OpenAI response: ${JSON.stringify(response.data)}`)

  const translatedText = choices[0]?.message?.content?.trim()

  const r: TranslateResult = {
    text,
    to,
    from,
    response,
    result: translatedText ? [translatedText] : undefined,
    linkToResult: '',
  }

  return r
}

describe('openai', () => {
  describe('transform', () => {
    const options: TranslateOptions = { text: 'Hello', from: 'en', to: 'ar' }

    it('should return translated text from a valid response', () => {
      const response = {
        data: {
          choices: [
            { message: { content: 'مرحبا' } },
          ],
        },
      }
      const result = transform(response, options)
      expect(result.result).to.eql(['مرحبا'])
      expect(result.from).to.equal('en')
      expect(result.to).to.equal('ar')
      expect(result.text).to.equal('Hello')
    })

    it('should trim whitespace from translated text', () => {
      const response = {
        data: {
          choices: [
            { message: { content: '  مرحبا  ' } },
          ],
        },
      }
      const result = transform(response, options)
      expect(result.result).to.eql(['مرحبا'])
    })

    it('should set result to undefined when content is empty', () => {
      const response = {
        data: {
          choices: [
            { message: { content: '' } },
          ],
        },
      }
      const result = transform(response, options)
      expect(result.result).to.be.undefined
    })

    it('should throw an error when choices is undefined', () => {
      const response = { data: {} }
      expect(() => transform(response, options)).to.throw('Unexpected OpenAI response')
    })

    it('should throw an error when choices is an empty array', () => {
      const response = { data: { choices: [] } }
      expect(() => transform(response, options)).to.throw('Unexpected OpenAI response')
    })

    it('should throw an error when data is null', () => {
      const response = { data: null }
      expect(() => transform(response, options)).to.throw('Unexpected OpenAI response')
    })

    it('should use default from/to when not provided', () => {
      const response = {
        data: {
          choices: [
            { message: { content: 'hola' } },
          ],
        },
      }
      const result = transform(response, { text: 'hello' })
      expect(result.from).to.equal('auto')
      expect(result.to).to.equal('auto')
    })
  })
})
