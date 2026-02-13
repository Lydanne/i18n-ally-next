<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from './store'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  locale?: string
  size?: string
  label?: boolean
}>(), {
  locale: 'en',
  size: '20',
  label: true,
})

const store = useAppStore()

const src = computed(() => {
  const idx = store.config.locales.indexOf(props.locale)
  const flag = store.config.flags[idx]
  if (!flag)
    return ''
  return `${store.config.extensionRoot}/res/flags/${flag}.svg`
})

const wrapperStyle = computed(() => props.label ? { width: '50px' } : {})
</script>

<template>
  <div class="flag-icon" :style="wrapperStyle">
    <img
      v-if="store.config.showFlags"
      v-bind="$attrs"
      :src="src"
      :width="size || '20'"
      :height="size || '20'"
    >
    <div v-if="label" class="locale-label monospace">
      {{ locale }}
    </div>
  </div>
</template>

<style scoped>
.flag-icon {
  padding: 3px;
  text-align: center;
  margin: auto;
}

.flag-icon img {
  margin: auto;
  display: block;
}

.locale-label {
  font-size: 0.7em;
  opacity: 0.6;
  line-height: 1em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
