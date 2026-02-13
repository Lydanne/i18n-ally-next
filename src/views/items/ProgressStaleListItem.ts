import type { ProgressRootItem } from './ProgressRootItem'
import { Config, CurrentFile, Global } from '~/core'
import { ProgressSubmenuItem } from './ProgressSubmenuItem'

export class ProgressStaleListItem extends ProgressSubmenuItem {
  constructor(protected root: ProgressRootItem) {
    super(root, 'view.progress_submenu.stale_keys', 'review-conflict')
  }

  // @ts-expect-error
  get contextValue() {
    const values: string[] = []
    if (this.node.locale !== Config.sourceLanguage)
      values.push('translatable')
    return values.join('-')
  }

  getKeys(): string[] {
    const sourceLanguage = Config.sourceLanguage
    const locale = this.node.locale
    if (locale === sourceLanguage)
      return []
    const loader = CurrentFile.loader
    const reviews = Global.reviews
    const staleKeys: string[] = []
    for (const key of loader.keys) {
      const snapshot = reviews.getSourceSnapshot(key)
      if (!snapshot)
        continue
      const currentValue = loader.getValueByKey(key, sourceLanguage) || ''
      if (snapshot.text !== currentValue) {
        const record = loader.getRecordByKey(key, locale)
        if (record?.value)
          staleKeys.push(key)
      }
    }
    return staleKeys
  }
}
