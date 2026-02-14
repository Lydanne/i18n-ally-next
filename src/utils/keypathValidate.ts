import { Global } from '~/core'

export function keypathValidate(keypath: string) {
  if (Global.namespaceEnabled) {
    const delimiter = Global.getNamespaceDelimiter()
    return !!keypath.match(new RegExp(`^[\\w\\-][\\w\\-[\\].${escapeRegex(delimiter)} ]*$`))
  }
  return !!keypath.match(/^[\w\-][\w\-[\]. ]*$/)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
