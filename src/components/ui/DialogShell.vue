<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    label?: string
    role?: 'menu' | 'dialog'
  }>(),
  { role: 'dialog' },
)

const emit = defineEmits<{ 'update:show': [boolean] }>()

const close = () => emit('update:show', false)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

watch(
  () => props.show,
  (open) => {
    if (open) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog" :duration="{ enter: 220, leave: 180 }">
      <div v-if="show" class="fixed inset-0 z-[80] flex items-center justify-center px-4">
        <div class="dialog-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
        <div
          :role="role"
          aria-modal="true"
          :aria-label="label"
          class="dialog-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141b] p-5"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active .dialog-backdrop,
.dialog-leave-active .dialog-backdrop {
  transition:
    background-color 180ms ease,
    backdrop-filter 180ms ease,
    -webkit-backdrop-filter 180ms ease;
}

.dialog-enter-active .dialog-panel {
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.dialog-leave-active .dialog-panel {
  transition:
    opacity 160ms ease,
    transform 160ms cubic-bezier(0.4, 0, 1, 1);
}

/* Opacity on the backdrop or above it drops the blur until it reaches 1, so ramp the blur itself. */
.dialog-enter-from .dialog-backdrop,
.dialog-leave-to .dialog-backdrop {
  background-color: transparent;
  -webkit-backdrop-filter: blur(0);
  backdrop-filter: blur(0);
}

.dialog-enter-from .dialog-panel,
.dialog-leave-to .dialog-panel {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active .dialog-panel,
  .dialog-leave-active .dialog-panel {
    transition: opacity 160ms ease;
  }

  .dialog-enter-from .dialog-panel,
  .dialog-leave-to .dialog-panel {
    transform: none;
  }
}
</style>
