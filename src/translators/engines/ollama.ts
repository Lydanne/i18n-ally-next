import type { TranslateOptions } from './base'
import axios from 'axios'
import { Config } from '~/core'
import { Log } from '~/utils'
import TranslateEngine from './base'

const DEFAULT_API_ROOT = 'http://localhost:11434'
const DEFAULT_MODEL = 'qwen2.5:latest'

/**
 * Ollama 翻译引擎，使用 Ollama 本地大模型进行翻译
 * 通过 OpenAI 兼容 API（/v1/chat/completions）调用
 */
export default class OllamaTranslate extends TranslateEngine {
  private get apiRoot(): string {
    return (Config.ollamaApiRoot || DEFAULT_API_ROOT).replace(/\/$/, '')
  }

  private get model(): string {
    return Config.ollamaModel || DEFAULT_MODEL
  }

  async translate(options: TranslateOptions) {
    const { text, from = 'auto', to = 'auto' } = options
    const prompt = `translate from ${from} to ${to}:\n\n${text}`
    Log.info(`🦙 Ollama translating (${from}->${to}) via ${this.model}`)
    const response = await axios.post(
      `${this.apiRoot}/v1/chat/completions`,
      {
        model: this.model,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'You are a professional translation engine. Return ONLY the translated text, no explanation, no quotes. Keep placeholders like {0}, {name}, {{variable}} unchanged.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      },
    )
    const translatedText = response.data.choices?.[0]?.message?.content?.trim()
    return {
      text,
      to,
      from,
      response,
      result: translatedText ? [translatedText] : undefined,
      linkToResult: '',
    }
  }
}
