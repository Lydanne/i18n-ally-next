import { defineStore } from 'pinia'
import { vscode } from './api'

export const useAppStore = defineStore('app', {
  state: () => {
    return Object.assign({
      ready: false,
      config: {
        debug: false,
        sourceLanguage: 'en',
        displayLanguage: 'en',
        enabledFrameworks: [],
        ignoredLocales: [],
        extensionRoot: '',
        flags: [],
        locales: [],
      },
      context: {},
      i18n: {},
      route: 'welcome',
      routeData: {},
    }, vscode.getState(), { ready: false })
  },
  actions: {
    setConfig(data) {
      this.config = data
    },
    setI18n(data) {
      this.i18n = data
    },
    setRoute({ route, data }) {
      this.routeData = data
      this.route = route
    },
    setContext(context) {
      this.context = context
    },
    setReady() {
      this.ready = true
    },
  },
})
