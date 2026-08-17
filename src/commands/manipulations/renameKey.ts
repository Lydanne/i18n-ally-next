import type { Node } from '~/core'
import { window, workspace } from 'vscode'
import { ActionSource, CurrentFile, Global, Telemetry, TelemetryKey } from '~/core'
import i18n from '~/i18n'
import { keypathValidate, Log } from '~/utils'
import { LocaleTreeItem } from '~/views'
import { overrideConfirm } from '../overrideConfirm'

interface RenameKeyOptions {
  preventOverride?: boolean
  showErrors?: boolean
}

export async function RenameKey(item?: LocaleTreeItem | string, options: RenameKeyOptions = {}) {
  if (!item)
    return

  Telemetry.track(TelemetryKey.RenameKey, {
    source: item instanceof LocaleTreeItem
      ? ActionSource.TreeView
      : ActionSource.UiEditor,
  })

  let node: Node | undefined

  if (typeof item === 'string')
    node = CurrentFile.loader.getTreeNodeByKey(item)
  else
    node = item.node

  if (!node)
    return

  try {
    const oldkeypath = node.keypath
    const newkeypath = await window.showInputBox({
      value: oldkeypath,
      prompt: i18n.t('prompt.enter_new_keypath'),
      ignoreFocusOut: true,
    })

    if (!newkeypath)
      return

    if (newkeypath === oldkeypath)
      return oldkeypath

    if (!keypathValidate(newkeypath)) {
      window.showWarningMessage(i18n.t('prompt.invalid_keypath'))
      await RenameKey(item, options)
      return
    }

    if (options.preventOverride && CurrentFile.loader.getTreeNodeByKey(newkeypath)) {
      window.showWarningMessage(i18n.t('prompt.key_already_exists'))
      return
    }

    if (!options.preventOverride && await overrideConfirm(newkeypath) !== 'override')
      return

    const edit = await Global.loader.renameKey(oldkeypath, newkeypath) // TODO:sfc
    await workspace.applyEdit(edit)

    return newkeypath
  }
  catch (err) {
    Log.error(err)
    if (options.showErrors)
      window.showErrorMessage(err instanceof Error ? err.message : String(err))
  }
}
