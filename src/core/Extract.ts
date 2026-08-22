import type { TextDocument } from 'vscode'
import type { ExtractInfo, PendingWrite } from './types'
import { existsSync, readFileSync } from 'fs'
import { basename, dirname, extname, resolve } from 'path'
import { nanoid } from 'nanoid'
import { window } from 'vscode'
import { replaceExtractionKey } from '~/extraction/utils'
import { changeCase } from '~/utils/changeCase'
import { generateSlugKey, generateTemplateWithKeygenKey } from '~/utils/keygen'
import { Config, Global } from '../extension'
import { CurrentFile } from './CurrentFile'

export function generateKeyFromText(text: string, filepath?: string, reuseExisting = false, usedKeys: string[] = []): string {
  let key: string | undefined

  // already existed, reuse the key
  // mostly for auto extraction
  if (reuseExisting) {
    key = Global.loader.searchKeyForTranslations(text)
    if (key)
      return key
  }

  // keygent
  const keygenStrategy = Config.keygenStrategy
  if (keygenStrategy === 'random') {
    key = nanoid()
  }
  else if (keygenStrategy === 'empty') {
    key = ''
  }
  else if (keygenStrategy === 'source') {
    key = text
  }
  else if (keygenStrategy === 'template') {
    key = resolveTemplate(Config.keygenTemplate, filepath)
  }
  else if (keygenStrategy === 'templateWithKeygen') {
    const prefix = resolveTemplate(Config.keygenTemplateWithKeygen, filepath)
    key = generateTemplateWithKeygenKey(
      prefix,
      text,
      Config.preferredDelimiter,
      Config.keygenStyle,
      Config.extractKeyMaxLength ?? Infinity,
      Config.keygenTemplateWithKeygenStrategy,
    )
  }
  else {
    key = generateSlugKey(text, Config.preferredDelimiter, Config.extractKeyMaxLength ?? Infinity)
  }

  const keyPrefix = Config.keyPrefix
  if (keyPrefix && keygenStrategy !== 'empty' && keygenStrategy !== 'source')
    key = keyPrefix + key

  if (filepath && key.includes('fileName')) {
    key = key
      .replace('{fileName}', basename(filepath))
      .replace('{fileNameWithoutExt}', basename(filepath, extname(filepath)))
  }

  key = keygenStrategy === 'templateWithKeygen'
    ? key.trim()
    : changeCase(key, Config.keygenStyle).trim()

  // some symbol can't convert to alphabet correctly, apply a default key to it
  if (!key)
    key = 'key'

  // suffix with a auto increment number if same key
  if (usedKeys.includes(key) || CurrentFile.loader.getNodeByKey(key)) {
    const originalKey = key
    let num = 0

    do {
      key = `${originalKey}${Config.preferredDelimiter}${num}`
      num += 1
    } while (
      usedKeys.includes(key) || CurrentFile.loader.getNodeByKey(key, false)
    )
  }

  return key
}

function findNearestPackageJson(startDir: string): { data: Record<string, unknown>, dir: string } | undefined {
  let dir = startDir
  while (true) {
    const pkgPath = resolve(dir, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        return { data: JSON.parse(readFileSync(pkgPath, 'utf-8')), dir }
      }
      catch {
        return undefined
      }
    }
    const parent = dirname(dir)
    if (parent === dir)
      return undefined
    dir = parent
  }
}

function resolveTemplate(template: string, filepath?: string): string {
  if (!template || !filepath)
    return ''
  const dir = dirname(filepath)
  const variables: Record<string, () => string> = {
    'dirname': () => basename(dir),
    'filename': () => basename(filepath, extname(filepath)),
    'package.name': () => {
      const pkg = findNearestPackageJson(dir)
      return (pkg?.data.name as string) ?? ''
    },
    'package_dirname': () => {
      const pkg = findNearestPackageJson(dir)
      return pkg ? basename(pkg.dir) : ''
    },
  }
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, varName: string) => {
    const resolver = variables[varName]
    return resolver ? resolver() : ''
  })
}

export async function extractHardStrings(document: TextDocument, extracts: ExtractInfo[], saveFile = false) {
  if (!extracts.length)
    return

  const editor = await window.showTextDocument(document)
  const filepath = document.uri.fsPath
  const sourceLanguage = Config.sourceLanguage
  const pendingWrites: PendingWrite[] = []
  const resolvedExtracts: ExtractInfo[] = []

  for (const extract of extracts) {
    if (extract.keypath == null || extract.message == null) {
      resolvedExtracts.push(extract)
      continue
    }

    const originalKey = extract.keypath
    const pending = await Global.loader.resolvePendingWrite({
      textFromPath: filepath,
      filepath: undefined,
      keypath: originalKey,
      value: extract.message,
      locale: extract.locale || sourceLanguage,
      inferNamespaceFromKey: Config.extractNamespaceMode,
      includeFileNamespace: true,
    })
    if (!pending)
      continue

    extract.keypath = pending.keypath
    extract.replaceTo = replaceExtractionKey(extract.replaceTo, originalKey, pending.keypath)
    pendingWrites.push(pending)
    resolvedExtracts.push(extract)
  }

  resolvedExtracts.sort((a, b) => b.range.start.compareTo(a.range.start))

  // replace
  await editor.edit((editBuilder) => {
    for (const extract of resolvedExtracts) {
      editBuilder.replace(
        extract.range,
        extract.replaceTo,
      )
    }
  })

  // save keys
  await CurrentFile.loader.write(pendingWrites)

  if (saveFile)
    await document.save()

  CurrentFile.invalidate()
}
