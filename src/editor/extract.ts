import type { CodeActionContext, CodeActionProvider, Command, TextDocument } from 'vscode'
import type { DiagnosticWithDetection } from './problems'
import type { ExtractTextOptions } from '~/commands/extractString'
import type { DetectionResult } from '~/core/types'
import type { ExtensionModule } from '~/modules'
import { CodeAction, CodeActionKind, languages, Range, Selection } from 'vscode'
import { Commands } from '~/commands'
import { Config, CurrentFile, Global } from '~/core'
import { parseHardString } from '~/extraction/parseHardString'
import i18n from '~/i18n'
import { PROBLEM_CODE_HARD_STRING } from './problems'

export function DetectionResultToExtraction(detection: DetectionResult, document: TextDocument): ExtractTextOptions {
  return {
    isDynamic: detection.isDynamic,
    document,
    text: '',
    rawText: detection.text.trim(),
    isInsert: false,
    range: new Range(
      document.positionAt(detection.start),
      document.positionAt(detection.end),
    ),
  }
}

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions(
    document: TextDocument,
    selection: Range | Selection,
    context: CodeActionContext,
  ): Promise<(Command | CodeAction)[]> {
    if (!Global.enabled)
      return []

    if (!Global.isLanguageIdSupported(document.languageId))
      return []

    const diagnostic = context.diagnostics.find(i => i.code === PROBLEM_CODE_HARD_STRING) as DiagnosticWithDetection | undefined

    // quick fix for hard string problems
    if (diagnostic?.detection) {
      const extract = new CodeAction(i18n.t('refactor.extract_text'), CodeActionKind.QuickFix)
      extract.command = {
        command: Commands.extract_text,
        title: i18n.t('refactor.extract_text'),
        arguments: [
          DetectionResultToExtraction(diagnostic.detection, document),
          diagnostic.detection,
        ],
      }
      extract.diagnostics = [diagnostic]
      extract.isPreferred = true

      const ignoreTitle = i18n.t('refactor.extract_ignore', diagnostic.detection.text)
      const ignore = new CodeAction(ignoreTitle, CodeActionKind.QuickFix)
      ignore.command = {
        command: Commands.extract_ignore,
        title: ignoreTitle,
        arguments: [
          diagnostic.detection.text,
        ],
      }
      ignore.diagnostics = [diagnostic]

      const ignoreFileTitle = i18n.t('refactor.extract_ignore_by_file', diagnostic.detection.text)
      const ignoreByFile = new CodeAction(ignoreFileTitle, CodeActionKind.QuickFix)
      ignoreByFile.command = {
        command: Commands.extract_ignore,
        title: ignoreTitle,
        arguments: [
          diagnostic.detection.text,
          document,
        ],
      }
      ignoreByFile.diagnostics = [diagnostic]

      return [extract, ignoreByFile, ignore]
    }

    // user selection context
    if (!(selection instanceof Selection))
      return []

    const result = parseHardString(document.getText(selection), document.languageId)
    if (!result)
      return []

    const { text, args } = result
    const actions: (Command | CodeAction)[] = []

    actions.push({
      command: Commands.extract_text,
      title: i18n.t('refactor.extract_text'),
      arguments: [],
    })

    // Check for existing translations to recommend, convert them to their templates and then to commands, and add the commands to the command array
    CurrentFile.loader.keys
      .map(key => ({
        label: key,
        description: CurrentFile.loader.getValueByKey(key, Config.displayLanguage, 30),
      }))
      .filter(labelDescription => labelDescription.description === text)
      .flatMap(t => Global.interpretRefactorTemplates(t.label, args, document, diagnostic?.detection))
      .map(t => ({
        command: Commands.replace_with,
        title: i18n.t('refactor.replace_with', t),
        arguments: [t],
      }))
      .forEach(c => actions.push(c))

    return actions
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(
      '*',
      new ExtractProvider(),
      {
        providedCodeActionKinds: [
          CodeActionKind.QuickFix,
          CodeActionKind.Refactor,
        ],
      },
    ),
  ]
}

export default m
