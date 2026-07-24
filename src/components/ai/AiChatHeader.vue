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
  <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/5 shrink-0">
    <button
      type="button"
      class="size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      title="Toggle chat history"
      @click="store.toggleSidebar()"
    >
      <font-awesome-icon icon="bars" />
    </button>

    <p class="flex-1 text-center text-lg font-semibold text-white tracking-wide truncate">
      MemoryfulAI
    </p>

    <div class="flex items-center gap-2">
      <AiModelSelector />

      <button
        v-if="!fullPage"
        type="button"
        class="size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        title="Open full page"
        @click="openDedicatedPage"
      >
        <font-awesome-icon icon="up-right-from-square" />
      </button>

      <button
        v-if="!fullPage"
        type="button"
        class="size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        title="Close"
        @click="store.close()"
      >
        <font-awesome-icon icon="xmark" />
      </button>
    </div>
  </div>
</template>
