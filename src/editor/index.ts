import type { ExtensionModule } from '~/modules'
import { flatten } from 'lodash'
import annotation from './annotation'
import completion from './completion'
import definition from './definition'
import extract from './extract'
import problems from './problems'
import refactor from './refactor'
import reference from './reference'
import reviewComments from './reviewComments'
import statusbar from './statusbar'

const m: ExtensionModule = (ctx) => {
  return flatten([
    annotation(ctx),
    completion(ctx),
    extract(ctx),
    refactor(ctx),
    definition(ctx),
    problems(ctx),
    reference(ctx),
    statusbar(ctx),
    reviewComments(ctx),
  ])
}

export default m
