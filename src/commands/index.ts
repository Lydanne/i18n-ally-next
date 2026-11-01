import type { ExtensionModule } from '~/modules'
import { flatten } from 'lodash'
import checkStaleTranslations from './checkStaleTranslations'
import configLanguages from './configLanguages'
import configLocales from './configLocalePaths'
import deepl from './deepl'
import detectHardStrings from './detectHardStrings'
import extractText from './extractString'
import batchHardStringsExtract from './extractStringBulk'
import findInFileByValue from './findInFileByValue'
import gotoNextUsage from './gotoNextUsage'
import gotoRange from './gotoRange'
import help from './help'
import keyManipulations from './keyManipulations'
import migrate from './migrate'
import editor from './openEditor'
import refreshUsageReport from './refreshUsageReport'
import review from './review'
import scanAndExtractAll from './scanAndExtractAll'
import searchByValue from './searchByValue'
import { searchDecorations } from './searchDecorations'
import selectEditorLLMModel from './selectEditorLLMModel'
import showReferences from './showReferences'
import translateAllMissing from './translateAllMissing'

const m: ExtensionModule = (ctx) => {
  return flatten([
    searchDecorations,
    configLocales(ctx),
    configLanguages(ctx),
    keyManipulations(ctx),
    extractText(ctx),
    detectHardStrings(ctx),
    batchHardStringsExtract(ctx),
    help(ctx),
    refreshUsageReport(ctx),
    editor(ctx),
    review(ctx),
    deepl(ctx),
    gotoRange(ctx),
    gotoNextUsage(ctx),
    translateAllMissing(ctx),
    scanAndExtractAll(ctx),
    checkStaleTranslations(ctx),
    selectEditorLLMModel(ctx),
    migrate(ctx),
    searchByValue(ctx),
    findInFileByValue(ctx),
    showReferences(ctx),
  ])
}

export * from './commands'

export default m
