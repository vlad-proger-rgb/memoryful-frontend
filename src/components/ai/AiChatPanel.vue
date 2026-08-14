<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useScrollLock } from '@vueuse/core'
import { useAiChatStore } from '@/stores/aiChat'
import AiChatInterface from './AiChatInterface.vue'

const store = useAiChatStore()

// The panel covers the whole viewport on a phone, where a scroll gesture would
// otherwise chain through to the page behind it
const isPageLocked = useScrollLock(document.body)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.isOpen) {
    store.close()
  }
}

watch(
  () => store.isOpen,
  (open) => {
    isPageLocked.value = open
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  isPageLocked.value = false
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ai-backdrop">
      <div
        v-if="store.isOpen"
        class="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        @click="store.close()"
      />
    </Transition>

    <div
      class="fixed inset-x-0 top-0 bottom-0 md:top-[var(--app-header-height)] md:bottom-auto z-[71] flex justify-center pointer-events-none"
    >
      <Transition name="ai-drop">
        <div
          v-if="store.isOpen"
          class="pointer-events-auto w-full h-full md:w-auto md:h-auto"
          @click.stop
        >
          <AiChatInterface />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.ai-backdrop-enter-active,
.ai-backdrop-leave-active {
  transition: opacity 220ms ease;
}

.ai-backdrop-enter-from,
.ai-backdrop-leave-to {
  opacity: 0;
}

.ai-drop-enter-active {
  transition:
    transform 340ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease;
}

.ai-drop-leave-active {
  transition:
    transform 220ms cubic-bezier(0.4, 0, 1, 1),
    opacity 180ms ease;
}

/* A sheet rises from the bottom edge; the desktop panel drops out of the header */
.ai-drop-enter-from,
.ai-drop-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .ai-drop-enter-from,
  .ai-drop-leave-to {
    transform: translateY(-32px) scale(0.96);
    transform-origin: top center;
  }
}
</style>
