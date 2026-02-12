import type { ProgressRootItem } from './ProgressRootItem'
import { ProgressSubmenuItem } from './ProgressSubmenuItem'

export class ProgressTranslatedListItem extends ProgressSubmenuItem {
  constructor(protected root: ProgressRootItem) {
    super(root, 'view.progress_submenu.translated_keys', 'checkmark')
  }

  getKeys() {
    return this.root.node.translatedKeys
  }
}
