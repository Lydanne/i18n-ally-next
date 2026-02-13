import type { BaseTagSystem } from './base'
import { BCP47 } from './bcp47'
import { LegacyTagSystem } from './legacy'
import { NoneTagSystem } from './none'

export const TagSystems: Record<string, BaseTagSystem> = {
  none: new NoneTagSystem(),
  bcp47: new BCP47(),
  legacy: new LegacyTagSystem(),
}
