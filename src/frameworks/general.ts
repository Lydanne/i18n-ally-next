import type { TextDocument } from 'vscode'
import type { LanguageId } from '~/utils'
import { Config } from '~/core'
import { DefaultDynamicExtractionsRules, DefaultExtractionRules, extractionsParsers } from '~/extraction'
import { Framework } from './base'

class GeneralFramework extends Framework {
  id = 'general'
  display = 'General'

  detection = {
    packageJSON: () => true,
  }

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'html',
  ]

  refactorTemplates(keypath: string, args: string[] = []) {
    let params = `'${keypath}'`
    if (args.length)
      params += `, [${args.join(', ')}]`
    return [
      `$t(${params})`,
      keypath,
    ]
  }

  usageMatchRegex = []

  supportAutoExtraction = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'html',
  ]

  detectHardStrings(doc: TextDocument) {
    const lang = doc.languageId
    const text = doc.getText()

    if (lang === 'html') {
      return extractionsParsers.html.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
        Config.extractParserHTMLOptions,
        // <script>
        script => extractionsParsers.babel.detect(
          script,
          DefaultExtractionRules,
          DefaultDynamicExtractionsRules,
          Config.extractParserBabelOptions,
        ),
      )
    }
    else {
      return extractionsParsers.babel.detect(
        text,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
      )
    }
  }
}

export default GeneralFramework
