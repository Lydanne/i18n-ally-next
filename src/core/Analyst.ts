import type { TextDocument } from 'vscode'
import type { KeyOccurrence, KeyUsage } from '.'
import type { OccurrenceIndex } from './OccurrenceIndex'
import type { UsageReport } from './types'
import fs from 'fs'
import _, { uniq } from 'lodash'
import micromatch from 'micromatch'
import { EventEmitter, Location, Range, Uri, workspace } from 'vscode'
import { Log } from '~/utils'
import { gitignoredGlob } from '~/utils/glob'
import { Config, KeyDetector } from '.'
import { CurrentFile } from './CurrentFile'
import { Global } from './Global'
import { createOccurrenceIndex } from './OccurrenceIndex'

export class Analyst {
  private static _cache: KeyOccurrence[] | null = null
  private static _occurrenceIndex: OccurrenceIndex | null = null
  private static _scanPromise: Promise<KeyOccurrence[]> | null = null
  private static _cacheRevision = 0
  static readonly _onDidUsageReportChanged = new EventEmitter<UsageReport>()
  static readonly onDidUsageReportChanged = Analyst._onDidUsageReportChanged.event
  static readonly _onDidOccurrencesChanged = new EventEmitter<void>()
  static readonly onDidOccurrencesChanged = Analyst._onDidOccurrencesChanged.event

  static invalidateCache() {
    this._cacheRevision++
    this._cache = null
    this._occurrenceIndex = null
    this._scanPromise = null
  }

  static watch() {
    return workspace.onDidSaveTextDocument(doc => this.updateCache(doc))
  }

  static hasCache() {
    return !!this._cache
  }

  static refresh() {
    if (this.hasCache())
      this.analyzeUsage(true)
  }

  private static async updateCache(doc: TextDocument) {
    if (!this._cache)
      return
    if (!Global.isLanguageIdSupported(doc.languageId))
      return

    const revision = this._cacheRevision
    const filepath = doc.uri.fsPath
    Log.info(`🔄 Update usage cache of ${filepath}`)
    const occurrences = await this.getOccurrencesOfText(doc, filepath)
    if (!this._cache || revision !== this._cacheRevision)
      return

    this._cache = this._cache.filter(o => o.filepath !== filepath)
    this._cache.push(...occurrences)
    this._occurrenceIndex = createOccurrenceIndex(this._cache, key => this.normalizeKey(key))
    this._onDidOccurrencesChanged.fire()
  }

  private static async enumerateDocumentPaths() {
    const root = Global.rootpath
    const files = await gitignoredGlob(Global.getSupportLangGlob(), root)
    return files.filter(f => !fs.lstatSync(f).isDirectory())
  }

  private static async getOccurrencesOfFile(filepath: string) {
    let doc = workspace.textDocuments.find(doc => doc.uri.fsPath === filepath)
    if (!doc)
      doc = await workspace.openTextDocument(Uri.file(filepath))
    return await this.getOccurrencesOfText(doc, filepath)
  }

  private static async getOccurrencesOfText(doc: TextDocument, filepath: string) {
    const keys = KeyDetector.getKeys(doc)
    const occurrences: KeyOccurrence[] = []

    for (const { start, end, key } of keys) {
      occurrences.push({
        keypath: key,
        start,
        end,
        filepath,
        line: doc.positionAt(start).line + 1,
      })
    }

    return occurrences
  }

  private static async scanOccurrences() {
    const occurrences: KeyOccurrence[] = []
    const filepaths = await this.enumerateDocumentPaths()

    for (const filepath of filepaths)
      occurrences.push(...await this.getOccurrencesOfFile(filepath))

    return occurrences
  }

  private static async ensureOccurrenceCache() {
    if (this._cache && this._occurrenceIndex)
      return

    if (!this._scanPromise) {
      const revision = this._cacheRevision
      const scanPromise = this.scanOccurrences()
      this._scanPromise = scanPromise

      try {
        const occurrences = await scanPromise
        if (revision === this._cacheRevision) {
          this._cache = occurrences
          this._occurrenceIndex = createOccurrenceIndex(occurrences, key => this.normalizeKey(key))
          this._onDidOccurrencesChanged.fire()
        }
      }
      finally {
        if (this._scanPromise === scanPromise)
          this._scanPromise = null
      }
    }
    else {
      await this._scanPromise
    }

    if (!this._cache || !this._occurrenceIndex)
      await this.ensureOccurrenceCache()
  }

  static async getOccurrenceIndex(useCache = true): Promise<OccurrenceIndex> {
    if (!useCache)
      this.invalidateCache()
    await this.ensureOccurrenceCache()
    return this._occurrenceIndex!
  }

  static async getAllOccurrences(targetKey?: string, useCache = true) {
    const index = await this.getOccurrenceIndex(useCache)
    if (targetKey)
      return index.get(this.normalizeKey(targetKey)) || []
    return this._cache!
  }

  static async getAllOccurrenceLocations(targetKey: string) {
    const occurrences = await this.getAllOccurrences(targetKey)
    return await Promise.all(occurrences.map(o => this.getLocationOf(o)))
  }

  static async getLocationOf(occurrence: KeyOccurrence) {
    const document = await workspace.openTextDocument(occurrence.filepath)
    const range = new Range(
      document.positionAt(occurrence.start),
      document.positionAt(occurrence.end),
    )
    return new Location(document.uri, range)
  }

  static normalizeKey(key: string) {
    return key.replace(/\[(.*)\]/g, '.$1')
  }

  static async analyzeUsage(useCache = true): Promise<UsageReport> {
    const occurrences = await this.getAllOccurrences(undefined, useCache)
    const usages: KeyUsage[] = _(occurrences)
      .groupBy('keypath')
      .entries()
      .map(([keypath, occurrences]) => ({ keypath, occurrences }))
      .value()

    // all the keys you have
    const allKeys = CurrentFile.loader.keys.map(i => this.normalizeKey(i))
    // keys occur in your code
    const inUseKeys = uniq([...usages.map(i => i.keypath), ...Config.keysInUse].map(i => this.normalizeKey(i)))
    // keys in use
    const activeKeys = inUseKeys.filter(i => allKeys.includes(i))
    // keys not in use
    let idleKeys = allKeys
      .filter(i => !inUseKeys.includes(i))
      .filter(i => !micromatch.isMatch(i, Config.keysInUse))
    // keys in use, but actually you don't have them
    let missingKeys = inUseKeys.filter(i => !allKeys.includes(i))

    const rules = Global.derivedKeyRules
    // remove derived keys from idle, if the source key is in use
    idleKeys = idleKeys.filter((key) => {
      for (const r of rules) {
        const match = r.exec(key)
        if (match && match[1] && activeKeys.includes(match[1]))
          return false
      }
      return true
    })

    // for derived keys whose source key is considered missing
    // (is actually in use, could be a nested pluralization key scenario)
    // - add the source key to active
    // - remove the source key from missing
    // - remove the derived key from idle
    const missingKeysShouldBeActive: string[] = []
    idleKeys = idleKeys.filter((key) => {
      for (const r of rules) {
        const match = r.exec(key)
        if (match && match[1] && missingKeys.includes(match[1])) {
          missingKeysShouldBeActive.push(match[1])
          return false
        }
      }
      return true
    })
    activeKeys.push(...uniq(missingKeysShouldBeActive))
    missingKeys = missingKeys.filter(i => !missingKeysShouldBeActive.includes(i))

    const report = {
      active: usages.filter(i => activeKeys.includes(i.keypath)),
      missing: usages.filter(i => missingKeys.includes(i.keypath)),
      idle: idleKeys.map(i => ({ keypath: i, occurrences: [] })),
    }

    this._onDidUsageReportChanged.fire(report)
    return report
  }
}
