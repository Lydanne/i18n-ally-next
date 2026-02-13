import { File } from '~/utils'
import { Parser } from './base'

const _fluent: typeof import('fluent-vue-cli') | undefined = (() => {
  // eslint-disable-next-line ts/no-require-imports
  try { return require('fluent-vue-cli') }
  catch { return undefined }
})()

export class FluentParser extends Parser {
  id = 'ftl'

  constructor() {
    super(['ftl'], 'ftl')
  }

  async parse(text: string) {
    if (!_fluent)
      throw new Error('fluent-vue-cli is not installed')
    return _fluent.getFtlMessages(text)
  }

  async dump(): Promise<string> {
    throw new Error('Not implemented')
  }

  async save(filepath: string, object: Record<string, string>) {
    if (!_fluent)
      throw new Error('fluent-vue-cli is not installed')
    const currentFile = await File.read(filepath)
    const text = _fluent.mergeFtl(currentFile, object)

    await File.write(filepath, text)
  }
}
