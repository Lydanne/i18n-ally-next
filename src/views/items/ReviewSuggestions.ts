import type { ExtensionContext } from 'vscode'
import type { ReviewCommentWithMeta } from '~/core'
import { TreeItemCollapsibleState } from 'vscode'
import i18n from '~/i18n'
import { BaseTreeItem } from '.'
import { ReviewSuggestionsItem } from './ReviewSuggestionsItem'

export class ReviewSuggestions extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly comments: ReviewCommentWithMeta[],
  ) {
    super(ctx)
    this.id = 'review_suggestions'
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('review-suggestions', false)
  }

  getLabel() {
    return `${i18n.t('review.suggestions')} (${this.comments.length})`
  }

  async getChildren() {
    return this.comments.map(c => new ReviewSuggestionsItem(this.ctx, c))
  }
}
