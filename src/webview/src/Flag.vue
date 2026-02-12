<script lang="ts">
import { defineComponent } from 'vue'
import { useAppStore } from './store'

export default defineComponent({
  inheritAttrs: false,

  setup() {
    const store = useAppStore()
    return { store }
  },

  props: {
    locale: { type: String, default: 'en' },
    size: { type: String, default: '20' },
    label: { type: Boolean, default: true },
  },

  computed: {
    src() {
      const idx = this.store.config.locales.indexOf(this.locale)
      const flag = this.store.config.flags[idx]
      if (!flag)
        return ''
      return `${this.store.config.extensionRoot}/res/flags/${flag}.svg`
    },
    style() {
      if (this.label) {
        return {
          width: '50px',
        }
      }
      return {}
    },
  },
})
</script>

<template lang="pug">
.flag-icon(:style='style')
  img(
    v-if='store.config.showFlags'
    v-bind='$attrs'
    :src='src'
    :width='size || "20"'
    :height='size || "20"'
  )
  .locale-label.monospace(v-if='label') {{locale}}
</template>

<style lang="stylus" scoped>
.flag-icon
  padding 3px
  text-align center
  margin auto

  img
    margin auto
    display block

  .locale-label
    font-size 0.7em
    opacity 0.6
    line-height 1em
    white-space nowrap
    text-overflow ellipsis
    overflow hidden
</style>
