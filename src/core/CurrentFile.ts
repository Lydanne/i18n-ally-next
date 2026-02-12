import type { ExtensionContext, Uri } from 'vscode'
import type { Loader } from '.'
import type { DetectionResult } from '~/core/types'
import { throttle } from 'lodash'
import { EventEmitter, window, workspace } from 'vscode'
import { DetectHardStrings } from '~/commands/detectHardStrings'
import { Log } from '~/utils/Log'
import { Analyst } from '.'
import { Global } from './Global'
import { ComposedLoader } from './loaders/ComposedLoader'
import { FluentVueSfcLoader } from './loaders/FluentVueSfcLoader'
import { VueSfcLoader } from './loaders/VueSfcLoader'

export class CurrentFile {
  static _vue_sfc_loader: VueSfcLoader | null = null
  static _fluent_vue_sfc_loader: FluentVueSfcLoader | null = null
  static _composed_loader = new ComposedLoader()
  static _onInvalidate = new EventEmitter<boolean>()
  static _onInitialized = new EventEmitter<void>()
  static _onHardStringDetected = new EventEmitter<DetectionResult[] | undefined>()
  static _currentUri: Uri | undefined

  static onInvalidate = CurrentFile._onInvalidate.event
  static onHardStringDetected = CurrentFile._onHardStringDetected.event
  static onInitialized = CurrentFile._onInitialized.event

  static get VueSfc() {
    return Global.hasFeatureEnabled('VueSfc')
  }

  static get FluentVueSfc() {
    return Global.hasFeatureEnabled('FluentVueSfc')
  }

  static watch(ctx: ExtensionContext) {
    ctx.subscriptions.push(workspace.onDidSaveTextDocument(e => this._currentUri && e?.uri === this._currentUri && this.update(e.uri)))
    ctx.subscriptions.push(workspace.onDidChangeTextDocument(e => this._currentUri && e?.document?.uri === this._currentUri && this.throttleUpdate(e.document.uri)))
    ctx.subscriptions.push(window.onDidChangeActiveTextEditor(e => e?.document && this.update(e.document.uri)))
    ctx.subscriptions.push(Global.onDidChangeLoader(() => {
      this.invalidate()
      this.updateLoaders()
      this._composed_loader.fire('{Config}')
    }))
    ctx.subscriptions.push(Analyst.watch())
    this.update(window.activeTextEditor?.document.uri)
  }

  static throttleUpdate = throttle((uri?: Uri) => CurrentFile.update(uri), 100)

  static update(uri?: Uri) {
    if (!Global.enabled)
      return

    this._currentUri = uri
    this.invalidate()
    if (this.VueSfc) {
      if (this._vue_sfc_loader) {
        if (uri && this._vue_sfc_loader.uri.path === uri.path) {
          this._vue_sfc_loader.load()
          return
        }
        else {
          this._vue_sfc_loader.dispose()
          this._vue_sfc_loader = null
        }
      }
      if (uri && uri.fsPath.endsWith('.vue'))
        this._vue_sfc_loader = new VueSfcLoader(uri)
    }

    if (this.FluentVueSfc) {
      if (this._fluent_vue_sfc_loader) {
        if (uri && this._fluent_vue_sfc_loader.uri.path === uri.path) {
          this._fluent_vue_sfc_loader.load()
          return
        }
        else {
          this._fluent_vue_sfc_loader.dispose()
          this._fluent_vue_sfc_loader = null
        }
      }
      if (uri && uri.fsPath.endsWith('.vue'))
        this._fluent_vue_sfc_loader = new FluentVueSfcLoader(uri)
    }

    this.updateLoaders()
    this._onInitialized.fire()
  }

  static updateLoaders() {
    const loaders: Loader[] = [Global.loader]

    if (this.VueSfc && this._vue_sfc_loader)
      loaders.push(this._vue_sfc_loader)

    if (this.FluentVueSfc && this._fluent_vue_sfc_loader)
      loaders.push(this._fluent_vue_sfc_loader)

    this._composed_loader.loaders = loaders
  }

  static get loader() {
    return this._composed_loader
  }

  static invalidate() {
    this.hardStrings = undefined
    this._onInvalidate.fire(true)
  }

  static hardStrings: DetectionResult[] | undefined

  static async detectHardStrings(force = false) {
    try {
      if (!this.hardStrings || force) {
        this.hardStrings = await DetectHardStrings()
        this._onHardStringDetected.fire(this.hardStrings)
      }
      return this.hardStrings
    }
    catch (e) {
      Log.error('Failed to extract current file', false)
      Log.error(e, false)
      this.hardStrings = []
      return this.hardStrings
    }
  }
}
