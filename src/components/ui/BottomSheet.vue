<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  show: boolean
  label?: string
  title?: string
}>()

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
    <Transition name="sheet">
      <div v-if="show" class="fixed inset-0 z-[80] flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
        <div
          role="menu"
          :aria-label="label"
          class="sheet-panel relative flex max-h-[75dvh] flex-col rounded-t-2xl border-t border-white/10 bg-[#14141b] pb-[env(safe-area-inset-bottom,0px)]"
        >
          <div class="shrink-0 px-4 pt-3 pb-2">
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

.sheet-enter-active .sheet-panel {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-leave-active .sheet-panel {
  transition: transform 200ms cubic-bezier(0.4, 0, 1, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active .sheet-panel,
  .sheet-leave-active .sheet-panel {
    transition: none;
  }

  .sheet-enter-from .sheet-panel,
  .sheet-leave-to .sheet-panel {
    transform: none;
  }
}
</style>
