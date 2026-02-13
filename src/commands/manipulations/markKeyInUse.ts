import type { LocaleTreeItem } from '~/views'
import { uniq } from 'lodash'
import { Config } from '~/core'

export async function markKeyInUse(item?: LocaleTreeItem) {
  if (!item)
    return

  const keypath = item.node.keypath
  Config.keysInUse = uniq([...Config.keysInUse, keypath])
}
