<script setup lang="ts">
import { ref } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import { useUiStore } from '@/stores/ui'
import AiSidebar from './AiSidebar.vue'
import AiChatHeader from './AiChatHeader.vue'
import AiMessageList from './AiMessageList.vue'
import AiMessageInput from './AiMessageInput.vue'

defineProps<{
  fullPage?: boolean
}>()

const store = useAiChatStore()
const uiStore = useUiStore()
const inputRef = ref<InstanceType<typeof AiMessageInput> | null>(null)

const onSuggestion = (text: string) => {
  inputRef.value?.fill(text)
}

const onAttach = () => {
  // Placeholder for attachments/mentions (photos, days, insights, etc.)
  uiStore.showToast('Attachments and mentions coming soon', 'info')
}
</script>

<template>
  <div
    class="ai-panel-bg relative flex overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/50"
    :class="fullPage ? 'w-full max-w-[900px] h-[calc(100vh-140px)]' : 'w-[720px] h-[600px]'"
  >
    <Transition name="ai-sidebar">
      <AiSidebar v-if="store.isSidebarOpen" />
    </Transition>

    <div class="flex-1 min-w-0 flex flex-col h-full">
      <AiChatHeader :full-page="fullPage" />

      <div v-if="store.isLoadingChat" class="flex-1 flex items-center justify-center">
        <font-awesome-icon icon="circle-notch" class="animate-spin text-white/40 text-xl" />
      </div>
      <AiMessageList v-else @suggestion="onSuggestion" />

      <AiMessageInput ref="inputRef" @attach="onAttach" />
    </div>
  </div>
</template>

<style scoped>
.ai-panel-bg {
  background:
    radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.12), transparent 55%),
    radial-gradient(circle at 80% 90%, rgba(59, 130, 246, 0.12), transparent 55%),
    rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(18px);
}

.ai-sidebar-enter-active,
.ai-sidebar-leave-active {
  transition: width 220ms ease, opacity 180ms ease;
  overflow: hidden;
}

.ai-sidebar-enter-from,
.ai-sidebar-leave-to {
  width: 0 !important;
  opacity: 0;
}
</style>
