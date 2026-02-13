import type { CodeActionContext, CodeActionProvider, Range, TextDocument } from 'vscode'
import type { DiagnosticWithKey } from './problems'
import type { Loader } from '~/core'
import type { ExtensionModule } from '~/modules'
import { CodeAction, CodeActionKind, languages } from 'vscode'
import { Commands } from '~/commands'
import { Config, CurrentFile } from '~/core'
import i18n from '~/i18n'
import { PROBLEM_KEY_MISSING, PROBLEM_TRANSLATION_MISSING } from './problems'

export class Refactor implements CodeActionProvider {
  public provideCodeActions(
    document: TextDocument,
    range: Range,
    context: CodeActionContext,
  ): CodeAction[] | undefined {
    const diagnostic = context.diagnostics.find(i => i.code === PROBLEM_KEY_MISSING || i.code === PROBLEM_TRANSLATION_MISSING) as DiagnosticWithKey | undefined

    const key = diagnostic?.key

    if (!diagnostic || !key)
      return

    const actions = []

    const loader: Loader = CurrentFile.loader

    const records = loader.getTranslationsByKey(key)
    if (!records[Config.displayLanguage] || !records[Config.displayLanguage].value) {
      actions.push(this.createEditQuickFix(key))

      for (const record of Object.values(records)) {
        if (!record.shadow && record.value && record.locale !== Config.displayLanguage)
          actions.push(this.createTranslateQuickFix(key, record.locale))
      }
    }

    return actions
  }

  private createEditQuickFix(key: string) {
    const title = i18n.t('command.edit_key')
    const action = new CodeAction(title, CodeActionKind.QuickFix)
    action.command = {
      title,
      command: Commands.edit_key,
      arguments: [{
        keypath: key,
        locale: Config.displayLanguage,
      }],
    }
    return action
  }

  private createTranslateQuickFix(key: string, from?: string, to?: string) {
    from = from || Config.sourceLanguage
    to = to || Config.displayLanguage
    const title = i18n.t('command.translate_key_from', from)
    const action = new CodeAction(title, CodeActionKind.QuickFix)
    action.command = {
      title,
      command: Commands.translate_key,
      arguments: [{
        keypath: key,
        locale: to,
        from,
      }],
    }
    return action
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(
      '*',
      new Refactor(),
      {
        providedCodeActionKinds: [
          CodeActionKind.Refactor,
          CodeActionKind.QuickFix,
        ],
      },
    ),
  ]
}

export default m
