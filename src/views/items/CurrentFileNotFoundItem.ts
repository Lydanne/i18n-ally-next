import type { CurrentFileLocalesTreeProvider } from '../providers'
import { TreeItemCollapsibleState } from 'vscode'
import { LocaleNode } from '~/core'
import i18n from '~/i18n'
import { LocaleTreeItem } from '.'
import { BaseTreeItem } from './Base'

export class CurrentFileNotFoundItem extends BaseTreeItem {
  constructor(public provider: CurrentFileLocalesTreeProvider) {
    super(provider.ctx)
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('warning')
  }

  // @ts-expect-error
  get description() {
    return this.getKeys().length.toString()
  }

  getLabel() {
    return i18n.t('view.current_file_keys_not_found', this.getKeys().length)
  }

  getKeys() {
    return this.provider.pathsNotFound
  }

  // @ts-expect-error
  get collapsibleState() {
    if (this.getKeys().length)
      return TreeItemCollapsibleState.Collapsed
    else
      return TreeItemCollapsibleState.None
  }

  set collapsibleState(_) { }

  async getChildren() {
    return this.getKeys()
      .map(keypath => new LocaleNode({ keypath, shadow: true }))
      .map(node => node && new LocaleTreeItem(this.ctx, node, true))
      .filter(item => item) as LocaleTreeItem[]
  }
}
