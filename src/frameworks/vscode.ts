import type { TextDocument } from 'vscode'
import type { LanguageId } from '~/utils'
import { basename } from 'node:path'
import { Framework } from './base'

class VSCodeFramework extends Framework {
  id = 'vscode'
  display = 'VS Code'

  detection = {
    packageJSON: [
      'vscode',
      '@types/vscode',
    ],
  }

  enabledParsers = ['json']

  languageIds: LanguageId[] = [
    'json',
    'javascript',
    'typescript',
  ]

  pathMatcher = () => 'package.nls.?{locale?}.json'

  usageMatchRegex = (languageIds?: string, filename?: string) => {
    if (filename && basename(filename) === 'package.json')
      return '"%({key})%"'
    // for visualize the regex, you can use https://regexper.com/
    return '(?:i18n[ (]path=|v-t=[\'"`{]|(?:this\\.|\\$|i18n\\.)(?:(?:d|n)\\(.*?,|(?:t|tc|te)\\()\\s*)[\'"`]({key})[\'"`]'
  }

  refactorTemplates(keypath: string, args?: string[], doc?: TextDocument) {
    if (doc?.languageId === 'json') {
      return [
        `%${keypath}%`,
        keypath,
      ]
    }

    return [
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }
}

export default VSCodeFramework
