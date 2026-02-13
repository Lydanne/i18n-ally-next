import { BasicExtrationRule } from './basic'
import { DynamicExtractionRule } from './dynamic'
import { NonAsciiExtractionRule } from './non-ascii-characters'

export * from './base'
export * from './basic'
export * from './non-ascii-characters'

export const DefaultExtractionRules = [
  new BasicExtrationRule(),
  new NonAsciiExtractionRule(),
]

export const DefaultDynamicExtractionsRules = [
  new DynamicExtractionRule(),
]
