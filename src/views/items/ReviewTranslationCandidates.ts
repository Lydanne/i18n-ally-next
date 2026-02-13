import type { ExtensionContext } from 'vscode'
import type { TranslationCandidateWithMeta } from '~/core'
import { TreeItemCollapsibleState } from 'vscode'
import i18n from '~/i18n'
import { BaseTreeItem } from '.'
import { ReviewTranslationCandidatesItem } from './ReviewTranslationCandidatesItem'

export class ReviewTranslationCandidates extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly candidates: TranslationCandidateWithMeta[],
  ) {
    super(ctx)
    this.id = 'review-translation-candidates'
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
    this.contextValue = 'translation-candidate'
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('translate-colored', false)
  }

  getLabel() {
    return `${i18n.t('review.translation_candidates')} (${this.candidates.length})`
  }

  async getChildren() {
    return this.candidates.map(c => new ReviewTranslationCandidatesItem(this.ctx, c))
  }
}
