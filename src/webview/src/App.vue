<script setup lang="ts">
import VCog from 'vue-material-design-icons/Cog.vue'
import VMagnify from 'vue-material-design-icons/Magnify.vue'
import VRefresh from 'vue-material-design-icons/Refresh.vue'
import { vscode } from './api'
import KeyEditor from './KeyEditor.vue'
import { useAppStore } from './store'

const store = useAppStore()

function refresh() {
  vscode.postMessage({ type: 'webview.refresh' })
}

function openSettings() {
  vscode.postMessage({ type: 'open-builtin-settings' })
}

function openSearch() {
  vscode.postMessage({ type: 'open-search' })
}
</script>

<template>
  <div class="container">
    <template v-if="store.ready">
      <div class="actions-bar">
        <VMagnify class="setting-button" @click="openSearch" />
        <VRefresh v-if="store.config.debug" class="setting-button" @click="refresh" />
        <VCog class="setting-button" @click="openSettings" />
      </div>

      <KeyEditor v-if="store.route === 'open-key'" :data="store.routeData" />
    </template>

    <template v-else>
      <p class="loading">
        Loading...
      </p>
    </template>
  </div>
</template>

<style>
.container {
  user-select: none;
  font-size: 1.1em;
  padding-bottom: 1.5em;
}

.container .actions-bar {
  position: absolute;
  padding: 1.2em;
  top: 0;
  right: 0;
  z-index: 10;
}

.setting-button {
  font-size: 1.6em;
  margin-left: 0.6em;
  opacity: 0.4;
  cursor: pointer;
}

.setting-button.small {
  font-size: 1em;
}

.setting-button:hover {
  opacity: 0.9;
}
</style>
