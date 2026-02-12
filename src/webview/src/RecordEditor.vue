<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { getCommentState } from '../../utils/shared'
import { vscode } from './api'
import Flag from './Flag.vue'
import ReviewComment from './ReviewComment.vue'
import { useAppStore } from './store'

const props = withDefaults(defineProps<{
  record?: Record<string, any>
  keypath?: string
  review?: Record<string, any>
  active?: boolean
}>(), {
  record: () => ({ locale: '', value: '' }),
  keypath: '',
  review: () => ({ comments: [] }),
  active: false,
})

const emit = defineEmits<{
  'update:active': [value: boolean]
}>()

const store = useAppStore()

const focused = ref(false)
const reviewing = ref(false)
const value = ref('')
const textarea1 = useTemplateRef<HTMLTextAreaElement>('textarea1')

const comments = computed(() =>
  (props.review?.comments || []).filter((i: any) => !i.resolved),
)

const reviewBrief = computed(() => getCommentState(comments.value))

const isReadonly = computed(() => props.record.readonly)

const changed = computed(() => value.value !== props.record.value)

function resizeTextarea(el: HTMLTextAreaElement | null | undefined) {
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight - 3}px`
}

function reset() {
  if (focused.value && changed.value)
    return
  value.value = props.record.value
}

function onFocus() {
  focused.value = true
  value.value = props.record.value
  emit('update:active', true)
}

function onBlur() {
  focused.value = false
  if (changed.value)
    save()
}

function save() {
  vscode.postMessage({
    type: 'edit',
    data: {
      keypath: props.record.keypath,
      locale: props.record.locale,
      value: value.value,
    },
  })
}

function translate() {
  vscode.postMessage({
    type: 'translate',
    data: { keypath: props.record.keypath, locale: props.record.locale },
  })
}

function transDiscard() {
  vscode.postMessage({
    type: 'translation.discard',
    keypath: props.record.keypath,
    locale: props.record.locale,
  })
}

function transApply() {
  vscode.postMessage({
    type: 'translation.apply',
    keypath: props.record.keypath,
    locale: props.record.locale,
  })
}

function transEdit() {
  vscode.postMessage({
    type: 'translation.edit',
    keypath: props.record.keypath,
    locale: props.record.locale,
  })
}

watch(() => props.record, () => reset(), { deep: true, immediate: true })
watch(() => props.keypath, () => reset())
watch(value, () => nextTick(() => resizeTextarea(textarea1.value)))
watch(() => props.active, (v) => {
  if (!v && changed.value)
    save()
})

onMounted(() => nextTick(() => resizeTextarea(textarea1.value)))
</script>

<template>
  <div class="record-editor" :class="{ active }">
    <div class="edit-input panel" :class="{ 'top-stacked': active && review.translation_candidate }">
      <Flag :locale="record.locale" size="18" />
      <textarea
        ref="textarea1"
        v-model="value"
        rows="1"
        :placeholder="$t('editor.empty')"
        :readonly="isReadonly"
        @focus="onFocus"
        @blur="onBlur"
      />

      <div v-if="active" class="buttons">
        <div v-if="isReadonly" class="button" disabled>
          <VPencilOff />
        </div>
        <div
          v-if="!isReadonly && !review.translation_candidate && record.locale !== store.config.sourceLanguage"
          class="button"
          @click="translate"
        >
          <VEarth />
          <span>{{ $t('editor.translate') }}</span>
        </div>
        <div v-if="store.config.review" class="button" @click="reviewing = !reviewing">
          <VCommentEditOutline />
          <span>{{ $t('review.review') }}</span>
        </div>
      </div>

      <div v-if="store.config.review" class="review-brief">
        <VEarth v-if="!active && review.translation_candidate" class="state-icon" />
        <VCheck v-if="reviewBrief === 'approve'" class="state-icon" />
        <VPlusMinus v-else-if="reviewBrief === 'request_change'" class="state-icon" />
        <VCommentQuestionOutline v-else-if="reviewBrief === 'conflict'" class="state-icon" />
        <VCommentOutline v-else-if="reviewBrief === 'comment'" class="state-icon" />
      </div>
    </div>

    <div v-if="active && review.translation_candidate" class="translation-candidate panel shadow bottom-stacked">
      <VEarth />
      <div class="text">
        {{ review.translation_candidate.text }}
      </div>
      <div class="buttons">
        <div class="button flat" @click="transDiscard">
          {{ $t('prompt.button_discard') }}
        </div>
        <div class="button" @click="transEdit">
          <VPencil />
          <span>{{ $t('prompt.button_edit_end_apply') }}</span>
        </div>
        <div class="button" @click="transApply">
          <VCheckAll />
          <span>{{ $t('prompt.button_apply') }}</span>
        </div>
      </div>
    </div>

    <div v-if="store.config.review && ((comments.length && active) || reviewing)" class="review-panel">
      <ReviewComment
        v-for="c in comments"
        :key="c.id || c.locale"
        :record="record"
        :comment="c"
      />
      <ReviewComment
        v-if="reviewing"
        :record="record"
        :editing="true"
        mode="create"
        @done="reviewing = false"
      />
    </div>
  </div>
</template>

<style scoped>
.record-editor {
  border-left: 2px solid transparent;
  padding-right: var(--i18n-ally-margin);
  padding-left: calc(var(--i18n-ally-margin) - 2px);
}

.record-editor.active {
  border-left: 2px solid var(--vscode-foreground);
}

.edit-input {
  display: grid;
  grid-template-columns: max-content auto max-content max-content;
  margin-top: 8px;
}

.edit-input .flag-icon {
  width: 2em;
  height: 1.8em;
  padding: 0.2em 0.2em 0.2em 0;
}

.edit-input .buttons {
  margin: auto;
}

.review-panel {
  padding-bottom: 8px;
}

.comment-form {
  padding: 6px 12px;
  margin-top: 0.3em;
}

.comment-form .buttons {
  margin-top: 0.7em;
  margin-bottom: 0.3em;
}

.state-icon {
  padding-left: 0.2em;
  font-size: 1.1em;
  margin-top: -0.1em;
}

.state-icon.earth-icon {
  opacity: 0.3;
}

.state-icon.plus-minus-icon {
  color: var(--review-request-change);
}

.state-icon.check-icon {
  color: var(--review-approve);
}

.state-icon.comment-question-outline-icon {
  color: var(--review-comment);
}

.state-icon.comment-outline-icon {
  opacity: 0.3;
}

.state-icon.format-quote-open-icon {
  opacity: 0.6;
}

.review-brief .state-icon {
  font-size: 1.4em;
  padding: 0.1em;
  margin: auto 0.2em;
}

.record-editor > * {
  vertical-align: middle;
}

.record-editor textarea {
  margin: auto;
  background: transparent;
  border: none;
  color: var(--vscode-foreground);
  width: 100%;
  resize: none;
  overflow-y: hidden;
  font-size: 0.8em;
}

.translation-candidate {
  display: grid;
  grid-template-columns: max-content auto max-content;
}

.translation-candidate :deep(.earth-icon) {
  margin: auto 0.6em auto 0.7em;
  font-size: 1.2em;
  height: 0.8em;
  opacity: 0.6;
}

.translation-candidate .text {
  margin: auto 0.4em;
  font-size: 0.8em;
  font-style: italic;
}
</style>
