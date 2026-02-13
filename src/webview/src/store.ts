import { defineStore } from 'pinia'
import { vscode } from './api'

interface AppConfig {
  readonly debug: boolean
  readonly sourceLanguage: string
  readonly displayLanguage: string
  readonly enabledFrameworks: string[]
  readonly ignoredLocales: string[]
  readonly extensionRoot: string
  readonly flags: string[]
  readonly locales: string[]
  readonly showFlags?: boolean
  readonly review?: boolean
  readonly user?: { name: string, email: string }
}

interface AppState {
  ready: boolean
  config: AppConfig
  context: Record<string, unknown>
  i18n: Record<string, unknown>
  route: string
  routeData: Record<string, unknown>
}

const DEFAULT_CONFIG: AppConfig = {
  debug: false,
  sourceLanguage: 'en',
  displayLanguage: 'en',
  enabledFrameworks: [],
  ignoredLocales: [],
  extensionRoot: '',
  flags: [],
  locales: [],
}

function createInitialState(): AppState {
  const saved = vscode.getState() as Partial<AppState> | undefined
  return {
    ready: false,
    config: saved?.config ?? DEFAULT_CONFIG,
    context: saved?.context ?? {},
    i18n: saved?.i18n ?? {},
    route: saved?.route ?? 'welcome',
    routeData: saved?.routeData ?? {},
  }
}

export const useAppStore = defineStore('app', {
  state: (): AppState => createInitialState(),
  actions: {
    setConfig(data: AppConfig) {
      this.config = data
    },
    setI18n(data: Record<string, unknown>) {
      this.i18n = data
    },
    setRoute({ route, data }: { route: string, data: Record<string, unknown> }) {
      this.routeData = data
      this.route = route
    },
    setContext(context: Record<string, unknown>) {
      this.context = context
    },
    setReady() {
      this.ready = true
    },
  },
})
