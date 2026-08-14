<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  show: boolean
  /** Names the menu for screen readers — usually what the actions apply to. */
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
  <!-- z-[80] clears AiChatPanel's z-[71] panel; anything lower renders behind the
       full-screen mobile panel and is invisible. -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[80] flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
        <div
          role="menu"
          :aria-label="label"
          class="relative flex max-h-[75dvh] flex-col rounded-t-2xl border-t border-white/10 bg-[#14141b] pb-[env(safe-area-inset-bottom,0px)]"
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
