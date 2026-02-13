import type { ExtensionContext } from 'vscode'
import type { DetectionResult } from '~/core'
import { basename } from 'path'
import { TreeItemCollapsibleState } from 'vscode'
import { BaseTreeItem } from './Base'
import { HardStringDetectResultItem } from './HardStringDetectResultItem'

/**
 * 按文件分组展示硬编码字符串的 TreeItem
 */
export class HardStringFileItem extends BaseTreeItem {
  constructor(
    ctx: ExtensionContext,
    private readonly filepath: string,
    private readonly detections: DetectionResult[],
  ) {
    super(ctx)
    this.id = `hard-string-file-${filepath}`
    this.collapsibleState = TreeItemCollapsibleState.Collapsed
  }

  getLabel() {
    return basename(this.filepath)
  }

  // @ts-expect-error
  get description() {
    return `${this.detections.length}`
  }

  // @ts-expect-error
  get tooltip() {
    return this.filepath
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('string')
  }

  async getChildren(): Promise<BaseTreeItem[]> {
    return this.detections.map(d => new HardStringDetectResultItem(this.ctx, d))
  }
}
