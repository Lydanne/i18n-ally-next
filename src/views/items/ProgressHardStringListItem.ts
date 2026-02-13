import type { ProgressRootItem } from './ProgressRootItem'
import type { DetectionResult } from '~/core'
import fs from 'fs-extra'
import { TreeItemCollapsibleState, Uri, workspace } from 'vscode'
import { DetectHardStrings } from '~/commands/detectHardStrings'
import { Global } from '~/core'
import i18n from '~/i18n'
import { Log } from '~/utils'
import { gitignoredGlob } from '~/utils/glob'
import { BaseTreeItem } from './Base'
import { HardStringDetectResultItem } from './HardStringDetectResultItem'

interface FileScanResult {
  readonly filepath: string
  readonly detections: DetectionResult[]
}

/**
 * 翻译进度视图中源语言下的"未提取的文案"子项
 * 扫描全项目硬编码字符串并展示
 */
export class ProgressHardStringListItem extends BaseTreeItem {
  private scanResults: FileScanResult[] | undefined
  private totalCount = 0

  constructor(root: ProgressRootItem) {
    super(root.ctx)
    this.id = `progress-${root.node.locale}-hard-strings`
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon('symbol-string')
  }

  getLabel() {
    return `${i18n.t('view.progress_submenu.hard_strings')} (${this.totalCount})`
  }

  // @ts-expect-error
  get collapsibleState() {
    return TreeItemCollapsibleState.Collapsed
  }

  set collapsibleState(_) { }

  async getChildren(): Promise<BaseTreeItem[]> {
    if (!this.scanResults)
      await this.scan()
    const items: BaseTreeItem[] = []
    for (const { detections } of (this.scanResults || [])) {
      for (const detection of detections)
        items.push(new HardStringDetectResultItem(this.ctx, detection))
    }
    return items
  }

  private async scan(): Promise<void> {
    const root = Global.rootpath
    const glob = Global.getSupportLangGlob()
    const files = await gitignoredGlob(glob, root)
    const validFiles = files.filter(f => !fs.lstatSync(f).isDirectory())
    const results: FileScanResult[] = []
    let total = 0
    for (const filepath of validFiles) {
      try {
        const doc = await workspace.openTextDocument(Uri.file(filepath))
        const detections = await DetectHardStrings(doc, false)
        if (detections?.length) {
          results.push({ filepath, detections })
          total += detections.length
        }
      }
      catch {
        Log.warn(`⚠️ Skip file: ${filepath}`)
      }
    }
    this.scanResults = results
    this.totalCount = total
  }
}
