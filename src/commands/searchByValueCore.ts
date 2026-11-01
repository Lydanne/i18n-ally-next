export interface ValueSearchResult {
  keypath: string
  locale: string
  value: string
  filepath?: string
}

interface SearchableLocaleNode {
  type: string
  locales: Record<string, { value: string, filepath?: string } | undefined>
}

export interface ValueSearchLoader {
  locales: string[]
  flattenLocaleTree: Record<string, SearchableLocaleNode | undefined>
}

export function searchTranslationKeysByValue(query: string, loader: ValueSearchLoader): ValueSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery)
    return []

  const results: ValueSearchResult[] = []
  for (const [keypath, node] of Object.entries(loader.flattenLocaleTree)) {
    if (!node || node.type !== 'node')
      continue

    for (const locale of loader.locales) {
      const record = node.locales[locale]
      if (record && typeof record.value === 'string' && record.value.toLowerCase().includes(normalizedQuery)) {
        results.push({
          keypath,
          locale,
          value: record.value,
          filepath: record.filepath,
        })
      }
    }
  }

  return results
}
