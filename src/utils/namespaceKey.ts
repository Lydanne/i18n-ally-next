export function withFileNamespace(keypath: string, namespace: string | undefined, delimiter: string) {
  if (!namespace)
    return keypath

  const prefix = `${namespace}${delimiter}`
  return keypath.startsWith(prefix) ? keypath : `${prefix}${keypath}`
}
