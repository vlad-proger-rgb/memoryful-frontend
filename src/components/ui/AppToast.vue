<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const toneClasses = computed(() => {
  if (uiStore.toastType === 'success') {
    return {
      ring: 'ring-1 ring-emerald-300/30',
      bg: 'bg-emerald-400/10',
      dot: 'bg-emerald-300',
      text: 'text-emerald-50',
      sub: 'text-emerald-100/80',
    }
  }

  if (uiStore.toastType === 'error') {
    return {
      ring: 'ring-1 ring-rose-300/30',
      bg: 'bg-rose-400/10',
      dot: 'bg-rose-300',
      text: 'text-rose-50',
      sub: 'text-rose-100/80',
    }
  }

  return {
    ring: 'ring-1 ring-white/15',
    bg: 'bg-white/10',
    dot: 'bg-white/70',
    text: 'text-white',
    sub: 'text-white/70',
  }
})
</script>

<template>
  <div class="fixed top-[72px] left-0 right-0 z-[60] flex justify-center px-3 pointer-events-none">
    <Transition name="app-toast">
      <div
        v-if="uiStore.isToastVisible"
        class="pointer-events-auto w-full max-w-md"
        role="status"
        aria-live="polite"
      >
        <div
          class="backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl shadow-black/30"
          :class="[toneClasses.ring, toneClasses.bg]"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-1 size-2 rounded-full shrink-0"
              :class="toneClasses.dot"
            />

            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold" :class="toneClasses.text">
                {{ uiStore.toastMessage }}
              </p>
              <p class="text-xs mt-0.5" :class="toneClasses.sub">
                {{ uiStore.toastType === 'success' ? 'All set' : uiStore.toastType === 'error' ? 'Please try again' : 'Notice' }}
              </p>
            </div>

            <button
              type="button"
              class="rounded-xl px-2 py-1 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition"
              @click="uiStore.hideToast"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 180ms ease;
}

.app-toast-enter-from,
.app-toast-leave-to {
  transform: translateY(-10px) scale(0.98);
  opacity: 0;
}
</style>
