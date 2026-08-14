<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAiChatStore } from '@/stores/aiChat'
import AiModelSelector from './AiModelSelector.vue'

defineProps<{
  fullPage?: boolean
}>()

const store = useAiChatStore()
const router = useRouter()

const openDedicatedPage = () => {
  store.close()
  router.push('/ai')
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 border-b border-white/5 shrink-0 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] md:pt-3"
  >
    <button
      type="button"
      class="size-11 md:size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Toggle chat history"
      title="Toggle chat history"
      @click="store.toggleSidebar()"
    >
      <font-awesome-icon icon="bars" />
    </button>

    <p
      class="flex-1 min-w-0 text-center text-base md:text-lg font-semibold text-white tracking-wide truncate"
    >
      MemoryfulAI
    </p>

    <div class="flex items-center gap-1 md:gap-2">
      <AiModelSelector />

      <!-- The mobile sheet already fills the screen, so "open full page" only means
           something on the desktop dropdown -->
      <button
        v-if="!fullPage"
        type="button"
        class="hidden md:flex size-8 rounded-lg items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Open full page"
        title="Open full page"
        @click="openDedicatedPage"
      >
        <font-awesome-icon icon="up-right-from-square" />
      </button>

      <button
        v-if="!fullPage"
        type="button"
        class="size-11 md:size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close"
        title="Close"
        @click="store.close()"
      >
        <font-awesome-icon icon="xmark" />
      </button>
    </div>
  </div>
</template>
