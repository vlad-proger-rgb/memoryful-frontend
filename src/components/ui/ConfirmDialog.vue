<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import BottomSheet from '@/components/ui/BottomSheet.vue'
import DialogShell from '@/components/ui/DialogShell.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'

withDefaults(
  defineProps<{
    show: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'neutral' | 'danger'
    busy?: boolean
  }>(),
  {
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    tone: 'danger',
    busy: false,
  },
)

const emit = defineEmits<{ 'update:show': [boolean]; confirm: [] }>()

const wideScreen = window.matchMedia('(min-width: 768px)')
const isWide = ref(wideScreen.matches)
const onWidthChange = (event: MediaQueryListEvent) => {
  isWide.value = event.matches
}
wideScreen.addEventListener('change', onWidthChange)
onBeforeUnmount(() => wideScreen.removeEventListener('change', onWidthChange))
</script>

<template>
  <component
    :is="isWide ? DialogShell : BottomSheet"
    :show="show"
    :label="title"
    role="dialog"
    @update:show="emit('update:show', $event)"
  >
    <div class="px-4 pb-4 text-white md:p-0">
      <p class="text-base font-semibold">{{ title }}</p>
      <p v-if="message" class="mt-2 text-sm text-white/70">{{ message }}</p>

      <slot />

      <div class="mt-5 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <SettingsButton
          preset="pill"
          class="justify-center"
          :label="cancelLabel"
          :disabled="busy"
          @click="emit('update:show', false)"
        />
        <SettingsButton
          preset="pill"
          class="justify-center"
          :tone="tone"
          :label="confirmLabel"
          :loading="busy"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </component>
</template>
