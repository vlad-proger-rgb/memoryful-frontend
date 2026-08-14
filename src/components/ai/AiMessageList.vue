<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import AiMessageBubble from './AiMessageBubble.vue'

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

// Grows as tokens arrive, so streaming keeps the view pinned to the bottom.
const streamedLength = computed(() => {
  const messages = store.currentChat?.messages
  if (!messages?.length) return 0
  const last = messages[messages.length - 1]
  return last.content.length + (last.tools?.length ?? 0)
})

const isNearBottom = () => {
  const el = scrollRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

// A new message always scrolls; mid-stream growth only follows along if the user
// hasn't scrolled up to read something earlier.
watch(
  () => [store.currentChat?.messages.length, store.isSending],
  () => scrollToBottom(),
  { flush: 'post' },
)

watch(
  streamedLength,
  () => {
    if (isNearBottom()) scrollToBottom()
  },
  { flush: 'post' },
)

// Opening a chat should land on the newest message. This component remounts
// whenever a chat finishes loading (the spinner replaces it), so mounting covers
// the common case; the id watch catches a swap that skips the loading state.
onMounted(() => scrollToBottom())

watch(
  () => store.currentChat?.id,
  () => scrollToBottom(),
  { flush: 'post' },
)

const emit = defineEmits<{ (e: 'suggestion', text: string): void }>()
</script>

<template>
  <div
    ref="scrollRef"
    class="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3 ai-scroll"
  >
    <Transition name="ai-swap" mode="out-in">
      <div
        v-if="store.currentChat && store.currentChat.messages.length"
        key="conversation"
        class="flex shrink-0 flex-col gap-3"
      >
        <TransitionGroup tag="div" class="contents" name="ai-msg">
          <AiMessageBubble
            v-for="(message, index) in store.currentChat.messages"
            :key="index"
            :message="message"
          />
        </TransitionGroup>
        <p
          v-if="store.sendError"
          class="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2"
        >
          {{ store.sendError }}
        </p>
      </div>

      <div
        v-else
        key="welcome"
        class="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8"
      >
        <div
          class="size-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center"
        >
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
    </Transition>
  </div>
</template>

<style scoped>
.ai-msg-enter-active {
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ai-msg-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .ai-msg-enter-active {
    transition-duration: 1ms;
  }

  .ai-msg-enter-from {
    transform: none;
  }
}

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
