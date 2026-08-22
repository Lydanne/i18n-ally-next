import type { DetectionResult } from '~/core/types'

const regexLeading = /^\s*/gm
const regexTailing = /\s+$/gm

export function trimDetection(detection: DetectionResult): DetectionResult | undefined {
  if (detection.preserveRange)
    return detection

  const leadingSpace = detection.text.match(regexLeading)?.[0] || ''
  const tailingSpace = detection.text.match(regexTailing)?.[0] || ''
  detection.start += leadingSpace.length
  detection.end -= tailingSpace.length

  if (detection.start >= detection.end)
    return undefined

  return detection
}

export function replaceExtractionKey(replacement: string, oldKey: string, newKey: string) {
  if (!oldKey || oldKey === newKey)
    return replacement

  for (const quote of ['"', '\'', '`']) {
    const token = `${quote}${oldKey}${quote}`
    const index = replacement.indexOf(token)
    if (index >= 0) {
      const keyStart = index + quote.length
      return `${replacement.slice(0, keyStart)}${newKey}${replacement.slice(keyStart + oldKey.length)}`
    }
  }

  const index = replacement.indexOf(oldKey)
  if (index < 0)
    return replacement
  return `${replacement.slice(0, index)}${newKey}${replacement.slice(index + oldKey.length)}`
}
