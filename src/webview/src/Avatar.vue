<script setup lang="ts">
import { computed } from 'vue'
import { getAvatarFromEmail } from '../../utils/shared'

const props = defineProps<{
  user?: { name: string, email: string }
}>()

const src = computed(() => getAvatarFromEmail(props.user?.email))
</script>

<template>
  <div class="avatar">
    <div class="image">
      <img :src="src">
    </div>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
}

.avatar .image {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  overflow: hidden;
  background: var(--vscode-foreground);
}
</style>
