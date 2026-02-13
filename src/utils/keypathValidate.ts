export function keypathValidate(keypath: string) {
  return !!keypath.match(/^[\w\-][\w\-[\]. ]*$/)
}
