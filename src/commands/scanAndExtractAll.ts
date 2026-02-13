import type { TextDocument } from 'vscode'
import type { DetectionResult } from '~/core'
import type { ExtensionModule } from '~/modules'
import { notNullish } from '@antfu/utils'
import fs from 'fs-extra'
import { commands, ProgressLocation, Uri, window, workspace } from 'vscode'
import { Commands } from '~/commands'
import { Config, Global } from '~/core'
import { extractHardStrings, generateKeyFromText } from '~/core/Extract'
import { ActionSource, Telemetry, TelemetryKey } from '~/core/Telemetry'
import { DetectionResultToExtraction } from '~/editor/extract'
import { parseHardString } from '~/extraction/parseHardString'
import i18n from '~/i18n'
import { Log } from '~/utils'
import { gitignoredGlob } from '~/utils/glob'
import { DetectHardStrings } from './detectHardStrings'

interface ScanResult {
  readonly filepath: string
  readonly detections: DetectionResult[]
}

/**
 * 扫描全项目硬编码字符串并批量提取为 i18n key
 */
async function scanAllFiles(): Promise<ScanResult[]> {
  const root = Global.rootpath
  const includeGlobs = Config.extractScanningInclude
  const glob = includeGlobs.length > 0
    ? (includeGlobs.length === 1 ? includeGlobs[0] : `{${includeGlobs.join(',')}}`)
    : Global.getSupportLangGlob()
  const files = await gitignoredGlob(glob, root, Config.extractScanningIgnore)
  const validFiles = files.filter(f => !fs.lstatSync(f).isDirectory())
  const results: ScanResult[] = []
  for (const filepath of validFiles) {
    try {
      const doc = await workspace.openTextDocument(Uri.file(filepath))
      const detections = await DetectHardStrings(doc, false)
      if (detections?.length) {
        results.push({ filepath, detections })
      }
    }
    catch {
      Log.warn(`⚠️ Skip file: ${filepath}`)
    }
  }
  return results
}

/**
 * 全项目扫描并提取硬编码字符串
 */
export async function ScanAndExtractAll() {
  Telemetry.track(TelemetryKey.ExtractStringBulk, { source: ActionSource.CommandPattele })
  await window.withProgress({
    location: ProgressLocation.Notification,
    title: i18n.t('prompt.scan_and_extract_scanning'),
    cancellable: true,
  }, async (progress, token) => {
    progress.report({ message: i18n.t('prompt.scan_and_extract_scanning') })
    const scanResults = await scanAllFiles()
    if (token.isCancellationRequested)
      return
    const totalDetections = scanResults.reduce((sum, r) => sum + r.detections.length, 0)
    if (!totalDetections) {
      window.showInformationMessage(i18n.t('prompt.scan_and_extract_no_results'))
      return
    }
    const Yes = i18n.t('prompt.button_yes')
    const confirmResult = await window.showWarningMessage(
      i18n.t('prompt.scan_and_extract_confirm', scanResults.length, totalDetections),
      { modal: true },
      Yes,
    )
    if (confirmResult !== Yes)
      return
    let processedFiles = 0
    const totalFiles = scanResults.length
    for (const { filepath, detections } of scanResults) {
      if (token.isCancellationRequested)
        break
      processedFiles++
      progress.report({
        message: `(${processedFiles}/${totalFiles}) ${filepath}`,
        increment: (1 / totalFiles) * 100,
      })
      try {
        const document = await workspace.openTextDocument(Uri.file(filepath))
        await extractFileHardStrings(document, detections)
      }
      catch (e) {
        Log.error(`Failed to extract ${filepath}`)
        Log.error(e, false)
      }
    }
    window.showInformationMessage(
      i18n.t('prompt.scan_and_extract_done', processedFiles, totalDetections),
    )
  })
}

async function extractFileHardStrings(document: TextDocument, detections: DetectionResult[]): Promise<void> {
  const usedKeys: string[] = []
  await extractHardStrings(
    document,
    detections.map((detection) => {
      const options = DetectionResultToExtraction(detection, document)
      if (options.rawText && !options.text) {
        const result = parseHardString(options.rawText, options.document.languageId, options.isDynamic)
        options.text = result?.text || ''
        options.args = result?.args
      }
      const { rawText, text, range, args } = options
      const filepath = document.uri.fsPath
      const keypath = generateKeyFromText(rawText || text, filepath, true, usedKeys)
      const templates = Global.interpretRefactorTemplates(keypath, args, document, detection).filter(Boolean)
      if (!templates.length) {
        Log.warn(`No refactor template found for "${keypath}" in "${filepath}"`)
        return undefined
      }
      usedKeys.push(keypath)
      return {
        range,
        replaceTo: templates[0],
        keypath,
        message: text,
        locale: Config.displayLanguage,
      }
    })
      .filter(notNullish),
    true,
  )
}

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(Commands.scan_and_extract_all, ScanAndExtractAll),
  ]
}

export default m
