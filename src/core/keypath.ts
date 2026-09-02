export function joinNamespaceKey(key: string, namespace?: string, delimiter = '.'): string {
  return namespace ? `${namespace}${delimiter}${key}` : key
}
