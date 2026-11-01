import type { DetectionResult } from '~/core/types'

const regexLeading = /^\s*/gm
const regexTailing = /\s+$/gm

export function detectionForSelection(detections: DetectionResult[], start: number, end: number): DetectionResult | undefined {
  const matches = detections.filter(item => (item.start <= start && item.end >= end) || (start <= item.start && end >= item.end))
  return matches.length === 1 ? matches[0] : undefined
}

export function trimDetection(detection: DetectionResult): DetectionResult | undefined {
  const leadingSpace = detection.text.match(regexLeading)?.[0] || ''
  const tailingSpace = detection.text.match(regexTailing)?.[0] || ''
  detection.start += leadingSpace.length
  detection.end -= tailingSpace.length

  if (detection.start >= detection.end)
    return undefined

  return detection
}
