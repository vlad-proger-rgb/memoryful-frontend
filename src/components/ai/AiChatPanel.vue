<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import AiChatInterface from './AiChatInterface.vue'

const store = useAiChatStore()

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.isOpen) {
    store.close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
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
      class="fixed inset-x-0 top-3 md:top-[var(--app-header-height)] z-[71] flex justify-center pointer-events-none"
    >
      <Transition name="ai-drop">
        <div v-if="store.isOpen" class="pointer-events-auto" @click.stop>
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

.ai-drop-enter-from,
.ai-drop-leave-to {
  opacity: 0;
  transform: translateY(-32px) scale(0.96);
  transform-origin: top center;
}
</style>
