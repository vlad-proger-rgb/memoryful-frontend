<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

import { useDragToDismiss } from '@/composables'

const props = withDefaults(
  defineProps<{
    show: boolean
    label?: string
    title?: string
    role?: 'menu' | 'dialog'
  }>(),
  { role: 'menu' },
)

const emit = defineEmits<{ 'update:show': [boolean] }>()

const close = () => emit('update:show', false)

const { style: dragStyle, handlers: dragHandlers } = useDragToDismiss({
  isOpen: () => props.show,
  onDismiss: close,
})

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
    <Transition name="sheet">
      <div v-if="show" class="fixed inset-0 z-[80] flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
        <div
          :role="role"
          :aria-modal="role === 'dialog' ? 'true' : undefined"
          :aria-label="label"
          class="sheet-panel relative flex max-h-[75dvh] flex-col rounded-t-2xl border-t border-white/10 bg-[#14141b] pb-[env(safe-area-inset-bottom,0px)]"
          :style="dragStyle"
        >
          <div class="shrink-0 touch-none px-4 pt-3 pb-2 select-none" v-on="dragHandlers">
            <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20" />
            <p v-if="title" class="truncate text-sm text-white/50">{{ title }}</p>
          </div>
          <div class="min-h-0 overflow-y-auto pb-2">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 200ms ease;
}

/* `translate`, not `transform`: the drag offset owns `transform`, and the two would collide. */
.sheet-enter-active .sheet-panel {
  transition: translate 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-leave-active .sheet-panel {
  transition: translate 200ms cubic-bezier(0.4, 0, 1, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  translate: 0 100%;
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active .sheet-panel,
  .sheet-leave-active .sheet-panel {
    transition: none;
  }

  .sheet-enter-from .sheet-panel,
  .sheet-leave-to .sheet-panel {
    translate: none;
  }
}
</style>
