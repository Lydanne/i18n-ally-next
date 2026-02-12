import { getFtlMessages, mergeFtl } from 'fluent-vue-cli'
import { File } from '~/utils'
import { Parser } from './base'

export class FluentParser extends Parser {
  id = 'ftl'

  constructor() {
    super(['ftl'], 'ftl')
  }

  async parse(text: string) {
    return getFtlMessages(text)
  }

  async dump(): Promise<string> {
    throw new Error('Not implemented')
  }

  async save(filepath: string, object: Record<string, string>) {
    const currentFile = await File.read(filepath)
    const text = mergeFtl(currentFile, object)

    await File.write(filepath, text)
  }
}
