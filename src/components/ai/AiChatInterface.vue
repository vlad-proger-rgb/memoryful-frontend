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
    class="ai-panel-bg relative flex overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
    :class="
      fullPage
        ? 'w-full max-w-[900px] h-[calc(100dvh-140px)] rounded-[28px]'
        : 'w-full h-full rounded-none md:w-[720px] md:h-[600px] md:rounded-[28px]'
    "
  >
    <Transition name="ai-scrim">
      <div
        v-if="store.isSidebarOpen"
        class="absolute inset-0 z-10 bg-black/50 md:hidden"
        @click="store.toggleSidebar()"
      />
    </Transition>

    <Transition name="ai-sidebar">
      <AiSidebar v-if="store.isSidebarOpen" />
    </Transition>

    <div class="flex-1 min-w-0 flex flex-col h-full">
      <AiChatHeader :full-page="fullPage" />

      <Transition name="ai-swap" mode="out-in">
        <div v-if="store.isLoadingChat" class="flex-1 flex items-center justify-center">
          <font-awesome-icon icon="circle-notch" class="animate-spin text-white/40 text-xl" />
        </div>
        <AiMessageList v-else @suggestion="onSuggestion" />
      </Transition>

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

/* Below md the chat list is a drawer over the conversation, so it slides in; at md+ it is
   a docked column and collapses its own width instead */
.ai-sidebar-enter-active,
.ai-sidebar-leave-active {
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease;
}

.ai-sidebar-enter-from,
.ai-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

@media (min-width: 768px) {
  .ai-sidebar-enter-active,
  .ai-sidebar-leave-active {
    transition:
      width 220ms ease,
      opacity 180ms ease;
    overflow: hidden;
  }

  .ai-sidebar-enter-from,
  .ai-sidebar-leave-to {
    width: 0 !important;
    transform: none;
    opacity: 0;
  }
}

.ai-scrim-enter-active,
.ai-scrim-leave-active {
  transition: opacity 200ms ease;
}

.ai-scrim-enter-from,
.ai-scrim-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ai-sidebar-enter-active,
  .ai-sidebar-leave-active,
  .ai-scrim-enter-active,
  .ai-scrim-leave-active {
    transition-duration: 1ms;
  }

  .ai-sidebar-enter-from,
  .ai-sidebar-leave-to {
    transform: none;
  }
}
</style>
