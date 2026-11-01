import type { KeyOccurrence } from './types'

export type OccurrenceIndex = ReadonlyMap<string, readonly KeyOccurrence[]>

export function createOccurrenceIndex(occurrences: KeyOccurrence[], normalizeKey: (key: string) => string = key => key): OccurrenceIndex {
  const index = new Map<string, KeyOccurrence[]>()

  for (const occurrence of occurrences) {
    const key = normalizeKey(occurrence.keypath)
    const indexed = index.get(key)
    if (indexed)
      indexed.push(occurrence)
    else
      index.set(key, [occurrence])
  }

  return index
}
