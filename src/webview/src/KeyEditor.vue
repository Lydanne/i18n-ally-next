<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { vscode } from './api'
import RecordEditor from './RecordEditor.vue'
import { useAppStore } from './store'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  data?: Record<string, any>
}>(), {
  data: () => ({ records: {} }),
})

const store = useAppStore()

const dragging = ref(false)
const sidebarWidth = ref(150)
const sidebar = ref(false)
const current = ref('')
const keyIndex = ref(0)

const context = computed(() => store.context as Record<string, any>)
const contextKeys = computed(() => (context.value.keys || []) as Record<string, any>[])
const config = computed(() => store.config)

const records = computed(() =>
  (config.value.locales || [])
    .filter((i: string) => !(config.value.ignoredLocales || []).includes(i))
    .map((l: string) => props.data.records[l]),
)

const emptyRecords = computed(() =>
  records.value.filter((i: any) =>
    !i.readonly
    && !i.value
    && !((props.data?.reviews?.locales || {})[i.locale]?.translation_candidate),
  ),
)

function editDescription() {
  vscode.postMessage({ type: 'review.description', keypath: props.data.keypath })
}

function renameKey() {
  vscode.postMessage({ type: 'rename-key', keypath: props.data.keypath })
}

function translateAll() {
  vscode.postMessage({
    type: 'translate',
    data: {
      keypath: props.data.keypath,
      locales: emptyRecords.value.map((i: any) => i.locale),
    },
  })
}

function gotoKey(v: number) {
  keyIndex.value = v
}

function nextKey(offset: number) {
  gotoKey(keyIndex.value + offset)
}

function onMousedown(e: MouseEvent) {
  if ((e.target as HTMLElement).className === 'resize-handler')
    dragging.value = true
}

function onMove(e: MouseEvent) {
  if (dragging.value)
    sidebarWidth.value = Math.min(Math.max(100, e.clientX - 20), window.innerWidth * 0.6)
}

watch(() => props.data.locale, (v) => {
  if (v)
    current.value = v || ''
})

watch(context, () => {
  keyIndex.value = props.data.keyIndex ?? contextKeys.value.indexOf(props.data.keypath) ?? 0
})

watch(keyIndex, () => {
  vscode.postMessage({
    type: 'navigate-key',
    data: {
      filepath: context.value.filepath,
      keyIndex: keyIndex.value,
      ...contextKeys.value[keyIndex.value],
    },
  })
})

watch(contextKeys, () => {
  if (!contextKeys.value?.length)
    sidebar.value = false
})
</script>

<template>
  <div
    class="key-editor"
    :class="{ 'with-sidebar': sidebar }"
    @mousedown="onMousedown"
    @mouseup="dragging = false"
    @mousemove="onMove"
  >
    <div v-if="sidebar" class="sidebar" :style="{ width: `${sidebarWidth}px` }">
      <div class="keys">
        <div
          v-for="(key, idx) in contextKeys"
          :key="idx"
          class="item panel"
          :class="{ active: idx === keyIndex }"
          @click="gotoKey(idx)"
        >
          <div class="key">
            {{ key.key }}
          </div>
          <div class="value" :class="{ empty: !key.value }">
            {{ key.value || $t('editor.empty') }}
          </div>
        </div>
      </div>
      <div class="resize-handler">
        <div class="inner" />
      </div>
    </div>

    <div class="content">
      <div class="header">
        <template v-if="contextKeys.length">
          <div class="buttons">
            <div v-if="contextKeys.length" class="button" @click="sidebar = !sidebar">
              <VMenu />
            </div>
            <div class="button" :disabled="keyIndex <= 0 || undefined" @click="nextKey(-1)">
              <VChevronLeft />
            </div>
            <div class="button" :disabled="keyIndex >= contextKeys.length - 1 || undefined" @click="nextKey(1)">
              <VChevronRight />
            </div>
          </div>
          <br>
        </template>

        <div class="key-name">
          <span>"{{ data.keypath }}"</span>
          <VPencil class="setting-button small" @click="renameKey" />
        </div>

        <div class="reviews">
          <template v-if="!data.reviews?.description">
            <div class="description add" @click="editDescription">
              {{ $t('editor.add_description') }}
            </div>
          </template>
          <template v-else>
            <div class="description" @click="editDescription">
              {{ data.reviews.description }}
            </div>
          </template>
        </div>

        <div class="buttons actions">
          <div v-if="emptyRecords.length" class="button" @click="translateAll">
            <VEarth />
            <span>{{ $t('editor.translate_all_missing') }} ({{ emptyRecords.length }})</span>
          </div>
        </div>
      </div>

      <div class="records">
        <RecordEditor
          v-for="r in records"
          :key="r.locale"
          :keypath="data.keypath"
          :record="r"
          :review="(data.reviews?.locales || {})[r.locale]"
          :active="current === r.locale"
          @update:active="current = r.locale"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.key-editor {
  display: grid;
}

.key-editor.with-sidebar {
  grid-template-columns: max-content auto;
}

.sidebar {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: 0.8em;
}

.resize-handler {
  position: absolute;
  top: 0;
  right: -6px;
  bottom: 0;
  padding: 0 6px;
  cursor: ew-resize;
}

.resize-handler .inner {
  height: 100%;
  width: 1px;
  background: var(--vscode-foreground);
  pointer-events: none;
  opacity: 0;
  transition: 0.2s ease-in-out;
}

.resize-handler:hover .inner {
  opacity: 0.5;
}

.keys {
  display: grid;
  grid-template-rows: auto;
  gap: 0.4em;
  overflow-x: auto;
}

.keys .item {
  font-size: 0.8em;
  opacity: 0.5;
  cursor: pointer;
}

.keys .item::before {
  opacity: 0.08;
}

.keys .item.active {
  opacity: 1;
  cursor: default;
}

.keys .item.active::before {
  opacity: 0.1;
}

.keys .item::after {
  opacity: 0 !important;
}

.keys .item .key {
  font-family: var(--vscode-editor-font-family);
}

.keys .item .value.empty {
  opacity: 0.5;
}

.header {
  padding: var(--i18n-ally-margin);
}

.key-name {
  font-family: var(--vscode-editor-font-family);
  opacity: 0.8;
}

.reviews {
  padding-bottom: 0.5em;
}

.description {
  cursor: pointer;
  min-width: 100px;
  display: inline-block;
  position: relative;
  padding: 0.4em;
}

.description:hover::after {
  content: "";
  background: var(--vscode-foreground);
  opacity: 0.1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 4px;
}

.description.add {
  opacity: 0.5;
  font-style: italic;
}
</style>
