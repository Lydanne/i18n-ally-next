<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep'
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { vscode } from './api'
import Avatar from './Avatar.vue'
import { useAppStore } from './store'

const props = withDefaults(defineProps<{
  editing?: boolean
  mode?: string
  comment?: Record<string, any>
  record?: Record<string, any>
}>(), {
  editing: false,
  mode: 'edit',
  comment: () => ({ comment: '', suggestion: '' }),
  record: () => ({ keypath: '', locale: '' }),
})

const emit = defineEmits<{
  'done': []
  'update:editing': [value: boolean]
}>()

const store = useAppStore()
const { t } = useI18n()

const isEditing = ref(props.editing)
const form = reactive({ comment: '', suggestion: '' })
const textarea2 = useTemplateRef<HTMLTextAreaElement>('textarea2')
const textarea3 = useTemplateRef<HTMLTextAreaElement>('textarea3')

const placeholders = computed(() => ({
  approve: t('review.placeholder.approve'),
  request_change: t('review.placeholder.request_change'),
  comment: t('review.placeholder.comment'),
}))

const isEditable = computed(
  () => props.comment.user?.email === store.config.user?.email,
)

function resetForm() {
  const cloned = cloneDeep(props.comment)
  form.comment = cloned.comment ?? ''
  form.suggestion = cloned.suggestion ?? ''
}

function resizeTextarea(el: HTMLTextAreaElement | null | undefined) {
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight - 3}px`
}

function cancel() {
  isEditing.value = false
  emit('update:editing', false)
  emit('done')
}

function postComment(type: string) {
  vscode.postMessage({
    type: props.mode === 'create' ? 'review.comment' : 'review.edit',
    keypath: props.record.keypath,
    locale: props.record.locale,
    data: { ...form, type },
  })
  isEditing.value = false
  emit('update:editing', false)
  emit('done')
}

function resolveComment(c: Record<string, any>) {
  vscode.postMessage({
    type: 'review.resolve',
    keypath: props.record.keypath,
    locale: props.record.locale,
    commentId: c.id,
  })
}

function acceptSuggestion(c: Record<string, any>) {
  vscode.postMessage({
    type: 'review.apply-suggestion',
    keypath: props.record.keypath,
    locale: props.record.locale,
    commentId: c.id,
  })
}

watch(() => props.editing, (v) => {
  isEditing.value = v
  if (v)
    resetForm()
}, { immediate: true })

watch(form, () => {
  nextTick(() => {
    resizeTextarea(textarea2.value)
    resizeTextarea(textarea3.value)
  })
}, { deep: true })
</script>

<template>
  <div class="review-comment">
    <!-- 查看模式 -->
    <div v-if="!isEditing" class="viewing">
      <Avatar :user="comment.user" />
      <div class="panel shadow comment-content">
        <VCheck v-if="comment.type === 'approve'" class="state-icon" />
        <VPlusMinus v-else-if="comment.type === 'request_change'" class="state-icon" />
        <VCommentOutline v-else class="state-icon" />

        <div class="text" :class="{ placeholder: !comment.comment }">
          {{ comment.comment || placeholders[comment.type as keyof typeof placeholders] }}
        </div>

        <div class="buttons">
          <div v-if="isEditable" class="button flat" @click="isEditing = true">
            <VPencil />
            <span>{{ $t('review.edit') }}</span>
          </div>
          <div class="button approve flat" @click="resolveComment(comment)">
            <VCheckboxMarkedOutline />
            <span>{{ $t('review.resolve') }}</span>
          </div>
        </div>
      </div>

      <template v-if="comment.suggestion">
        <div />
        <div class="panel shadow comment-content">
          <VFormatQuoteOpen class="state-icon" />
          <div class="text">
            {{ comment.suggestion }}
          </div>
          <div class="buttons">
            <div class="button flat" @click="acceptSuggestion(comment)">
              {{ $t('review.accept_suggestion') }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="editing">
      <Avatar :user="store.config.user" />
      <div class="panel comment-form">
        <label>{{ $t('review.comment') }}</label>
        <div class="panel">
          <textarea
            ref="textarea2"
            v-model="form.comment"
            rows="1"
            :placeholder="$t('review.optional')"
          />
        </div>

        <label>{{ $t('review.suggestion') }}</label>
        <div class="panel">
          <textarea
            ref="textarea3"
            v-model="form.suggestion"
            rows="1"
            :placeholder="$t('review.optional')"
          />
        </div>

        <div class="buttons">
          <div class="button approve" :disabled="!!form.suggestion || undefined" @click="postComment('approve')">
            <VCheck />
            <span>{{ $t('review.approve') }}</span>
          </div>
          <div class="button request-change" @click="postComment('request_change')">
            <VPlusMinus />
            <span>{{ $t('review.request_change') }}</span>
          </div>
          <div class="button comment" :disabled="!form.comment || undefined" @click="postComment('comment')">
            <VCommentOutline />
            <span>{{ $t('review.leave_comment') }}</span>
          </div>
          <div class="button" @click="cancel">
            {{ $t('prompt.button_cancel') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewing,
.editing {
  display: grid;
  grid-template-columns: max-content auto;
}

.viewing > .avatar,
.editing > .avatar {
  margin: 0.6em 0.4em 0 1.2em;
}

.comment-content {
  display: grid;
  grid-template-columns: min-content auto max-content max-content;
  margin-top: 0.4em;
}

.comment-content .text {
  margin: auto 6px;
  font-size: 0.8em;
}

.comment-content .text.placeholder {
  font-style: italic;
  opacity: 0.4;
}

.comment-content .buttons .button {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
