import type { TranslateOptions, TranslateResult } from './base'
import { Config } from '~/core'
import TranslateEngine from './base'
import { requestOpenAITranslation } from './openaiRequest'

export default class OpenAITranslate extends TranslateEngine {
  apiRoot = 'https://api.openai.com'
  systemPrompt = 'You are a professional translation engine. Please translate text without explanation.'

  async translate(options: TranslateOptions) {
    const apiKey = Config.openaiApiKey
    let apiRoot = this.apiRoot
    if (Config.openaiApiRoot)
      apiRoot = Config.openaiApiRoot.replace(/\/$/, '')
    const model = Config.openaiApiModel

    const response = await requestOpenAITranslation(
      apiRoot,
      apiKey,
      model,
      this.systemPrompt,
      this.generateUserPrompts(options),
    )

    return this.transform(response, options)
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const { text, from = 'auto', to = 'auto' } = options

    const translatedText = response.data.choices[0].message.content?.trim()

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

  generateUserPrompts(options: TranslateOptions): string {
    const sourceLang = options.from
    const targetLang = options.to

    const generatedUserPrompt = `translate from ${sourceLang} to ${targetLang}:\n\n${options.text}`

    return generatedUserPrompt
  }
}
