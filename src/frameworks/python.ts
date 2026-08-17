import type { TextDocument } from 'vscode'
import type { DetectionResult } from '~/core/types'
import type { LanguageId } from '~/utils'
import { Config } from '~/core'
import { DefaultExtractionRules, extractionsParsers } from '~/extraction'
import { Framework } from './base'
import { buildPythonRefactorTemplate, isPythonProject } from './python-utils'

export class PythonFramework extends Framework {
  id = 'python'
  display = 'Python'

  detection = {
    none: (_packages: string[], root: string) => isPythonProject(root),
  }

  languageIds: LanguageId[] = ['python']

  enabledParsers = ['json', 'yaml', 'json5', 'po']

  usageMatchRegex = [
    String.raw`(?:^|[^\w])(?:_|gettext|dgettext|ugettext)\(\s*['"]({key})['"]`,
    String.raw`(?:^|[^\w])(?:ngettext|dngettext|ungettext)\(\s*['"]({key})['"]`,
    String.raw`(?:^|[^\w])(?:pgettext|dpgettext)\(\s*['"][^'"]*['"]\s*,\s*['"]({key})['"]`,
    String.raw`(?:^|[^\w])(?:npgettext|dnpgettext)\(\s*['"][^'"]*['"]\s*,\s*['"]({key})['"]`,
  ]

  supportAutoExtraction = ['python']

  refactorTemplates(keypath: string, _args: string[] = [], _document?: TextDocument, detection?: DetectionResult) {
    return [buildPythonRefactorTemplate(
      keypath,
      detection?.namedArgs ?? [],
      Config.extractParserPythonOptions.fStringArgumentStyle ?? 'keyword-arguments',
    )]
  }

  detectHardStrings(document: TextDocument) {
    if (document.languageId !== 'python')
      return []
    return extractionsParsers.python.detect(
      document.getText(),
      DefaultExtractionRules,
      Config.extractParserPythonOptions,
    )
  }
}

export default PythonFramework
