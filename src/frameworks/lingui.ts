import type { LanguageId } from '~/utils'
import { Framework } from './base'

class LinguiFramework extends Framework {
  id = 'lingui'
  display = 'Lingui'

  detection = {
    packageJSON: [
      '@lingui/core',
    ],
  }

  enabledParsers = [
    'po',
  ]

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '\\bt`({key})`',
    '<Trans>[\\s]*({key})[\\s]*<\\/Trans>',
  ]

  refactorTemplates(keypath: string) {
    return [
      `t\`${keypath}\``,
      `<Trans>${keypath}</Trans>`,
      keypath,
    ]
  }

  pathMatcher() {
    return '{locale}/messages.po'
  }
}

export default LinguiFramework
