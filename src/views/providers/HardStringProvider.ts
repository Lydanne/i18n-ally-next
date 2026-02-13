import type { Event, ExtensionContext, TreeDataProvider, TreeItem } from 'vscode'
import type { BaseTreeItem } from '../items/Base'
import type { DetectionResult } from '~/core'
import fs from 'fs-extra'
import { EventEmitter, Uri, workspace } from 'vscode'
import { DetectHardStrings } from '~/commands/detectHardStrings'
import { Config, Global } from '~/core'
import { Log } from '~/utils'
import { gitignoredGlob } from '~/utils/glob'
import { HardStringFileItem } from '../items/HardStringFileItem'

interface FileScanResult {
  readonly filepath: string
  readonly detections: DetectionResult[]
}

/**
 * 独立的「未提取的文案」视图 Provider
 * 扫描全项目硬编码字符串，按文件分组展示
 */
export class HardStringProvider implements TreeDataProvider<BaseTreeItem> {
  protected name = 'HardStringProvider'
  private _onDidChangeTreeData: EventEmitter<BaseTreeItem | undefined> = new EventEmitter<BaseTreeItem | undefined>()
  readonly onDidChangeTreeData: Event<BaseTreeItem | undefined> = this._onDidChangeTreeData.event
  private scanResults: FileScanResult[] = []

  constructor(private ctx: ExtensionContext) {}

  refresh(): void {
    this.scanResults = []
    this._onDidChangeTreeData.fire(undefined)
  }

  getTreeItem(element: BaseTreeItem): TreeItem {
    return element
  }

  async getChildren(element?: BaseTreeItem): Promise<BaseTreeItem[]> {
    if (element)
      return await element.getChildren() as BaseTreeItem[]
    if (!this.scanResults.length)
      await this.scan()
    return this.scanResults.map(r => new HardStringFileItem(this.ctx, r.filepath, r.detections))
  }

  private async scan(): Promise<void> {
    const root = Global.rootpath
    const includeGlobs = Config.extractScanningInclude
    const glob = includeGlobs.length > 0
      ? (includeGlobs.length === 1 ? includeGlobs[0] : `{${includeGlobs.join(',')}}`)
      : Global.getSupportLangGlob()
    const files = await gitignoredGlob(glob, root, Config.extractScanningIgnore)
    const validFiles = files.filter(f => !fs.lstatSync(f).isDirectory())
    const results: FileScanResult[] = []
    for (const filepath of validFiles) {
      try {
        const doc = await workspace.openTextDocument(Uri.file(filepath))
        const detections = await DetectHardStrings(doc, false)
        if (detections?.length)
          results.push({ filepath, detections })
      }
      catch {
        Log.warn(`⚠️ Skip file: ${filepath}`)
      }
    }
    this.scanResults = results
  }
}
