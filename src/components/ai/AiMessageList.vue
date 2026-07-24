<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import AiMessageBubble from './AiMessageBubble.vue'
import AiTypingIndicator from './AiTypingIndicator.vue'

const store = useAiChatStore()
const scrollRef = ref<HTMLElement | null>(null)

const suggestions = [
  'Summarize my week so far',
  'What patterns show up in my recent days?',
  'Give me one small suggestion for tomorrow',
]

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

watch(
  () => [store.currentChat?.messages.length, store.isSending],
  () => scrollToBottom(),
  { flush: 'post' },
)

const emit = defineEmits<{ (e: 'suggestion', text: string): void }>()
</script>

<template>
  <div ref="scrollRef" class="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3 ai-scroll">
    <template v-if="store.currentChat && store.currentChat.messages.length">
      <AiMessageBubble
        v-for="(message, index) in store.currentChat.messages"
        :key="index"
        :message="message"
      />
      <AiTypingIndicator v-if="store.isSending" />
      <p
        v-if="store.sendError"
        class="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2"
      >
        {{ store.sendError }}
      </p>
    </template>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
      <div class="size-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center">
        <font-awesome-icon icon="wand-magic-sparkles" class="text-2xl text-white/80" />
      </div>
      <div>
        <p class="text-white font-semibold text-lg">MemoryfulAI</p>
        <p class="text-white/50 text-sm mt-1 max-w-[280px]">
          Ask about your days, habits, or get quick suggestions.
        </p>
      </div>

      <p
        v-if="store.sendError"
        class="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2 max-w-[320px]"
      >
        {{ store.sendError }}
      </p>

      <div class="flex flex-col gap-2 w-full max-w-[320px]">
        <button
          v-for="s in suggestions"
          :key="s"
          type="button"
          class="text-left text-sm text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-colors"
          @click="emit('suggestion', s)"
        >
          {{ s }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.ai-scroll::-webkit-scrollbar {
  width: 6px;
}

.ai-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
</style>
