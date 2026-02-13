import type { ExtensionContext } from 'vscode'
import type { ReviewCommentWithMeta } from '~/core'
import { TreeItemCollapsibleState } from 'vscode'
import i18n from '~/i18n'
import { BaseTreeItem } from '.'
import { ReviewRequestChangesItem } from './ReviewRequestChangesItem'

export class ReviewRequestChangesRoot extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    public readonly comments: ReviewCommentWithMeta[],
  ) {
    super(ctx)
    this.id = 'review_request_changes'
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('review-request-change', false)
  }

  getLabel() {
    return `${i18n.t('review.request_change_messages')} (${this.comments.length})`
  }

  async getChildren() {
    return this.comments.map(c => new ReviewRequestChangesItem(this.ctx, c))
  }
}
