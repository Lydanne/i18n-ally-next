import type { ExtensionContext, TextDocument } from 'vscode'
import type { ExtractTextOptions } from '~/commands/extractString'
import type { DetectionResult, NamedInterpolationArgument } from '~/core/types'
import { Range, TreeItemCollapsibleState } from 'vscode'
import { Commands } from '~/commands'
import { BaseTreeItem } from './Base'

export class HardStringDetectResultItem extends BaseTreeItem implements ExtractTextOptions {
  collapsibleState = TreeItemCollapsibleState.None
  text = ''
  isDynamic?: boolean
  range: Range
  rawText?: string
  args?: string[]
  namedArgs?: NamedInterpolationArgument[]
  document: TextDocument
  isInsert?: boolean | undefined

  constructor(
    readonly ctx: ExtensionContext,
    public readonly detection: DetectionResult,
  ) {
    super(ctx)

    const document = this.detection.document!

    this.document = document
    this.text = detection.translationText ?? ''
    this.rawText = (detection.translationText ?? detection.text).trim()
    this.args = detection.namedArgs?.map(argument => argument.expression)
    this.namedArgs = detection.namedArgs
    this.isInsert = false
    this.isDynamic = detection.isDynamic

    this.contextValue = 'i18n-ally-next-hard-string-item'
    this.label = this.detection.text.trim()

    this.range = new Range(
      document.positionAt(this.detection.start),
      document.positionAt(this.detection.end),
    )

    this.command = {
      title: 'Go To',
      command: Commands.go_to_range,
      arguments: [
        this.detection.document,
        this.range,
      ],
    }
  }
}
