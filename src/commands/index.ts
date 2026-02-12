import type { ExtensionModule } from '~/modules'
import { flatten } from 'lodash'
import configLanguages from './configLanguages'
import configLocales from './configLocalePaths'
import deepl from './deepl'
import detectHardStrings from './detectHardStrings'
import extractText from './extractString'
import batchHardStringsExtract from './extractStringBulk'
import gotoNextUsage from './gotoNextUsage'
import gotoRange from './gotoRange'
import help from './help'
import keyManipulations from './keyManipulations'
import editor from './openEditor'
import refreshUsageReport from './refreshUsageReport'
import review from './review'

const m: ExtensionModule = (ctx) => {
  return flatten([
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
  ])
}

export * from './commands'

export default m
