import { createApp, watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import VCheck from 'vue-material-design-icons/Check.vue'
import VCheckAll from 'vue-material-design-icons/CheckAll.vue'
import VCheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'
import VChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import VChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import VCommentEditOutline from 'vue-material-design-icons/CommentEditOutline.vue'
import VCommentOutline from 'vue-material-design-icons/CommentOutline.vue'
import VCommentQuestionOutline from 'vue-material-design-icons/CommentQuestionOutline.vue'
import VDeleteEmptyOutline from 'vue-material-design-icons/DeleteEmptyOutline.vue'
import VEarth from 'vue-material-design-icons/Earth.vue'
import VFormatQuoteOpen from 'vue-material-design-icons/FormatQuoteOpen.vue'
import VMenu from 'vue-material-design-icons/Menu.vue'
import VPencil from 'vue-material-design-icons/Pencil.vue'
import VPencilOff from 'vue-material-design-icons/PencilOff.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'
import { vscode } from './api'
import { useAppStore } from './store'
import App from './App.vue'
import './styles.css'
import 'vue-material-design-icons/styles.css'

const LOCALE = 'en'

const i18n = createI18n({
  legacy: true,
  locale: LOCALE,
  messages: {},
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)

app.component('VCheck', VCheck)
app.component('VCheckAll', VCheckAll)
app.component('VCheckboxMarkedOutline', VCheckboxMarkedOutline)
app.component('VChevronLeft', VChevronLeft)
app.component('VChevronRight', VChevronRight)
app.component('VCommentEditOutline', VCommentEditOutline)
app.component('VCommentOutline', VCommentOutline)
app.component('VCommentQuestionOutline', VCommentQuestionOutline)
app.component('VDeleteEmptyOutline', VDeleteEmptyOutline)
app.component('VEarth', VEarth)
app.component('VFormatQuoteOpen', VFormatQuoteOpen)
app.component('VMenu', VMenu)
app.component('VPencil', VPencil)
app.component('VPencilOff', VPencilOff)
app.component('VPlusMinus', VPlusMinus)

app.mount('#app')

const store = useAppStore()

window.addEventListener('message', (event: MessageEvent) => {
  const message = event.data
  switch (message.type) {
    case 'ready':
      store.setReady()
      break
    case 'config':
      store.setConfig(message.data)
      break
    case 'route':
      store.setRoute(message)
      break
    case 'i18n':
      store.setI18n(message.data)
      i18n.global.setLocaleMessage(LOCALE, message.data)
      break
    case 'context':
      store.setContext(message.data)
      break
  }
})

watch(
  () => store.$state,
  () => { vscode.setState(store.$state as unknown as Record<string, unknown>) },
  { deep: true },
)

vscode.postMessage({ type: 'ready' })
