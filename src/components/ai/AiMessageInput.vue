<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'

const store = useAiChatStore()
const emit = defineEmits<{
  (e: 'attach'): void
}>()
const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const MAX_HEIGHT = 140

const autoGrow = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
}

const send = async () => {
  const value = text.value
  if (!value.trim() || store.isSending) return
  text.value = ''
  nextTick(autoGrow)
  await store.sendMessage(value)
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
