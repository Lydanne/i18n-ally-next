import type { TranslateOptions } from './engines/base'
import BaiduTranslate from './engines/baidu'
import TranslateEngine from './engines/base'
import DeepLTranslateEngine from './engines/deepl'
import EditorLLMTranslateEngine from './engines/editor-llm'
import GoogleTranslateEngine from './engines/google'
import GoogleTranslateCnEngine from './engines/google-cn'
import LibreTranslateEngine from './engines/libretranslate'
import OllamaTranslateEngine from './engines/ollama'
import OpenAITranslateEngine from './engines/openai'

export class Translator {
  engines: Record<string, TranslateEngine> = {
    'google': new GoogleTranslateEngine(),
    'google-cn': new GoogleTranslateCnEngine(),
    'deepl': new DeepLTranslateEngine(),
    'libretranslate': new LibreTranslateEngine(),
    'baidu': new BaiduTranslate(),
    'openai': new OpenAITranslateEngine(),
    'ollama': new OllamaTranslateEngine(),
    'editor-llm': new EditorLLMTranslateEngine(),
  }

  async translate(options: TranslateOptions & { engine: string }) {
    const engine = this.engines[options.engine]
    return await engine.translate(options)
  }
}

export {
  BaiduTranslate,
  DeepLTranslateEngine,
  EditorLLMTranslateEngine,
  GoogleTranslateCnEngine,
  GoogleTranslateEngine,
  LibreTranslateEngine,
  OllamaTranslateEngine,
  OpenAITranslateEngine,
  TranslateEngine,
}

export * from './engines/base'
