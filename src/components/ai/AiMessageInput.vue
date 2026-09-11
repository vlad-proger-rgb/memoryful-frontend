<script setup lang="ts">
import { nextTick, onMounted, ref, computed } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'

const store = useAiChatStore()
const emit = defineEmits<{
  (e: 'attach'): void
}>()

const text = computed({
  get: () => store.draft,
  set: (v: string) => {
    store.draft = v
  },
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const MAX_HEIGHT = 140

const autoGrow = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
}

onMounted(() => {
  if (text.value) nextTick(autoGrow)
})

const send = async () => {
  const value = text.value
  if (!value.trim() || store.isSending) return

  const pinned = store.attachment
  const message = pinned ? `${pinned.content}\n\n${value}` : value

  text.value = ''
  store.clearAttachment()
  nextTick(autoGrow)
  await store.sendMessage(message)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

defineExpose({
  fill: (value: string) => {
    text.value = value
    nextTick(() => {
      autoGrow()
      textareaRef.value?.focus()
    })
  },
})
</script>

<template>
  <div class="px-3 pt-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:pb-3 shrink-0">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-in"
      enter-from-class="opacity-0 translate-y-1"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="store.attachment" class="mb-1.5 flex">
        <span
          class="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/8 py-1.5 pr-1.5 pl-2.5 text-xs text-white/70"
        >
          <font-awesome-icon
            :icon="store.attachment.icon"
            class="shrink-0 text-[11px] text-white/40"
          />
          <span class="truncate">{{ store.attachment.label }}</span>
          <button
            type="button"
            class="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-white/35 transition hover:bg-white/10 hover:text-white"
            aria-label="Remove attachment"
            @click="store.clearAttachment()"
          >
            <font-awesome-icon icon="xmark" class="text-[10px]" />
          </button>
        </span>
      </div>
    </Transition>

    <div
      class="flex items-end gap-2 bg-white/10 hover:bg-white/[0.13] focus-within:bg-white/[0.13] backdrop-blur-md border border-white/10 focus-within:border-white/25 rounded-2xl px-2 py-2 transition-colors"
    >
      <button
        type="button"
        class="shrink-0 size-11 md:size-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Add attachment or mention"
        title="Add attachment or mention"
        @click="emit('attach')"
      >
        <font-awesome-icon icon="plus" class="text-sm" />
      </button>

      <!-- 16px on mobile deliberately: iOS Safari zooms the page on focusing anything smaller -->
      <textarea
        ref="textareaRef"
        v-model="text"
        rows="1"
        placeholder="Message MemoryfulAI..."
        class="flex-1 resize-none bg-transparent outline-none text-base md:text-sm text-white placeholder:text-white/40 max-h-[140px] py-1.5"
        :disabled="store.isSending"
        @input="autoGrow"
        @keydown="onKeydown"
      />
      <button
        type="button"
        class="shrink-0 size-11 md:size-8 rounded-full flex items-center justify-center transition-all duration-150"
        aria-label="Send message"
        :class="
          text.trim() && !store.isSending
            ? 'bg-white text-black hover:scale-105'
            : 'bg-white/10 text-white/30 cursor-not-allowed'
        "
        :disabled="!text.trim() || store.isSending"
        @click="send"
      >
        <font-awesome-icon v-if="!store.isSending" icon="arrow-up" class="text-xs" />
        <font-awesome-icon v-else icon="circle-notch" class="text-xs animate-spin" />
      </button>
    </div>
  </div>
</template>
