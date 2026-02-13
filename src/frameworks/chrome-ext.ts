import type { RewriteKeySource } from '../core/types'
import type { LanguageId } from '~/utils'
import { Framework } from './base'

class ChromeExtensionFramework extends Framework {
  id = 'chrome-ext'
  display = 'Chrome Extension'

  detection = {}

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'html',
  ]

  usageMatchRegex = [
    'i18n\\.getMessage\\(\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string) {
    return [
      `chrome.i18n.getMessage('${keypath}')`,
      `browser.i18n.getMessage('${keypath}')`,
      keypath,
    ]
  }

  rewriteKeys(key: string, source: RewriteKeySource) {
    if (source === 'reference' && !key.endsWith('.message'))
      return `${key}.message`
    if (source === 'write' && !key.endsWith('.message'))
      return `${key}.message`
    if (source === 'source' && key.endsWith('.message'))
      return key.slice(0, -'.message'.length - 1)
    return key
  }
}

export default ChromeExtensionFramework
