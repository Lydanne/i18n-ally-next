import type { TranslateOptions, TranslateResult } from './base'
import * as vscode from 'vscode'
import { Config } from '~/core'
import { Log } from '~/utils'
import TranslateEngine from './base'

/** IDE 环境类型 */
type IDEType = 'cursor' | 'windsurf' | 'vscode'

/** 批量翻译请求项 */
interface BatchTranslateItem {
  readonly key: string
  readonly text: string
}

/** 批量翻译结果 */
type BatchTranslateResult = Record<string, string>

/** 检测当前 IDE 环境 */
export function detectIDEType(appName: string): IDEType {
  const name = appName.toLowerCase()
  if (name.includes('cursor'))
    return 'cursor'
  if (name.includes('windsurf'))
    return 'windsurf'
  return 'vscode'
}

/** 根据 IDE 类型获取 vendor */
export function getVendorByIDE(ide: IDEType): string | undefined {
  switch (ide) {
    case 'cursor':
      return 'copilot'
    case 'windsurf':
      return 'copilot'
    case 'vscode':
      return 'copilot'
  }
}

/**
 * 解析批量翻译的 JSON 响应（纯函数，方便测试）
 */
export function parseBatchResponse(
  raw: string,
  items: { readonly key: string, readonly text: string }[],
): Record<string, string> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch)
      throw new Error('No JSON found in response')
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>
    return parsed
  }
  catch {
    const result: Record<string, string> = {}
    const lines = raw.split('\n').filter(l => l.trim())
    items.forEach((item, idx) => {
      if (idx < lines.length)
        result[item.key] = lines[idx].replace(/^["']|["']$/g, '').trim()
    })
    return result
  }
}

/** 每批翻译的最大条数 */
const BATCH_SIZE = 20

/**
 * 编辑器内置大模型翻译引擎
 * 自动检测 Cursor/Windsurf/VSCode 环境，调用编辑器内置 LLM 进行翻译
 */
export default class EditorLLMTranslate extends TranslateEngine {
  private cachedModel: vscode.LanguageModelChat | undefined
  private ideType: IDEType = detectIDEType(vscode.env.appName)

  /**
   * 获取可用的语言模型
   */
  private async getModel(): Promise<vscode.LanguageModelChat> {
    if (this.cachedModel)
      return this.cachedModel
    if (!vscode.lm?.selectChatModels)
      throw new Error('Language Model API is not available in this editor version')
    const preferredModel = Config.editorLLMModel
    if (preferredModel) {
      const matched = await vscode.lm.selectChatModels({ id: preferredModel })
      if (matched.length) {
        this.cachedModel = matched[0]
        Log.info(`🤖 IDE: ${this.ideType}, Model (configured): ${matched[0].name} (${matched[0].id})`)
        return this.cachedModel
      }
      Log.info(`🤖 Configured model "${preferredModel}" not found, falling back to auto-select`)
    }
    const vendor = getVendorByIDE(this.ideType)
    const selector: vscode.LanguageModelChatSelector = vendor ? { vendor } : {}
    const models = await vscode.lm.selectChatModels(selector)
    if (!models.length) {
      const allModels = await vscode.lm.selectChatModels()
      if (allModels.length) {
        this.cachedModel = allModels[0]
        Log.info(`🤖 Using fallback model: ${allModels[0].name} (${allModels[0].id})`)
        return this.cachedModel
      }
      throw new Error(`No language model available in ${this.ideType}. Please ensure Copilot or AI extension is installed.`)
    }
    this.cachedModel = models[0]
    Log.info(`🤖 IDE: ${this.ideType}, Model: ${models[0].name} (${models[0].id})`)
    return this.cachedModel
  }

  /**
   * 构建翻译 prompt
   */
  private buildPrompt(text: string, from: string, to: string): vscode.LanguageModelChatMessage[] {
    return [
      vscode.LanguageModelChatMessage.User(
        `You are a professional i18n translation engine. Translate the following text from "${from}" to "${to}". `
        + `Rules:\n`
        + `1. Return ONLY the translated text, no explanation, no quotes.\n`
        + `2. Keep placeholders like {0}, {name}, {{variable}}, $t(key) unchanged.\n`
        + `3. Keep HTML tags unchanged.\n`
        + `4. Maintain the same tone and style.\n\n`
        + `Text to translate:\n${text}`,
      ),
    ]
  }

  /**
   * 构建批量翻译 prompt
   */
  private buildBatchPrompt(items: BatchTranslateItem[], from: string, to: string): vscode.LanguageModelChatMessage[] {
    const jsonInput = JSON.stringify(
      Object.fromEntries(items.map(i => [i.key, i.text])),
      null,
      2,
    )
    return [
      vscode.LanguageModelChatMessage.User(
        `You are a professional i18n translation engine. Translate all values in the following JSON from "${from}" to "${to}". `
        + `Rules:\n`
        + `1. Return ONLY valid JSON with the same keys and translated values.\n`
        + `2. Keep placeholders like {0}, {name}, {{variable}}, $t(key) unchanged.\n`
        + `3. Keep HTML tags unchanged.\n`
        + `4. Do NOT add any explanation or markdown formatting.\n\n`
        + `JSON to translate:\n${jsonInput}`,
      ),
    ]
  }

  /**
   * 发送请求并收集完整响应
   */
  private async sendRequest(
    model: vscode.LanguageModelChat,
    messages: vscode.LanguageModelChatMessage[],
  ): Promise<string> {
    const tokenSource = new vscode.CancellationTokenSource()
    const response = await model.sendRequest(messages, {}, tokenSource.token)
    let result = ''
    for await (const fragment of response.text)
      result += fragment
    return result.trim()
  }

  /**
   * 单条翻译（实现 TranslateEngine 接口）
   */
  async translate(options: TranslateOptions): Promise<TranslateResult> {
    const { text, from = 'auto', to = 'auto' } = options
    const model = await this.getModel()
    const messages = this.buildPrompt(text, from, to)
    const translatedText = await this.sendRequest(model, messages)
    return {
      text,
      to,
      from,
      response: { model: model.name, ide: this.ideType },
      result: translatedText ? [translatedText] : undefined,
      linkToResult: '',
    }
  }

  /**
   * 批量翻译多条文案（一次请求）
   */
  async translateBatch(
    items: BatchTranslateItem[],
    from: string,
    to: string,
  ): Promise<BatchTranslateResult> {
    if (!items.length)
      return {}
    const model = await this.getModel()
    const allResults: BatchTranslateResult = {}
    const chunks: BatchTranslateItem[][] = []
    for (let i = 0; i < items.length; i += BATCH_SIZE)
      chunks.push(items.slice(i, i + BATCH_SIZE))
    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const messages = this.buildBatchPrompt(chunk, from, to)
        const raw = await this.sendRequest(model, messages)
        return this.parseBatchResponse(raw, chunk)
      }),
    )
    for (const chunkResult of chunkResults)
      Object.assign(allResults, chunkResult)
    return allResults
  }

  /**
   * 解析批量翻译的 JSON 响应
   */
  private parseBatchResponse(raw: string, items: BatchTranslateItem[]): BatchTranslateResult {
    return parseBatchResponse(raw, items)
  }

  /**
   * 检查 LLM API 是否可用
   */
  static async isAvailable(): Promise<boolean> {
    try {
      if (!vscode.lm?.selectChatModels)
        return false
      const models = await vscode.lm.selectChatModels()
      return models.length > 0
    }
    catch {
      return false
    }
  }
}
