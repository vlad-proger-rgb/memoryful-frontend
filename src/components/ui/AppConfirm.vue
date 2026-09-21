<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import BottomSheet from '@/components/ui/BottomSheet.vue'
import DialogShell from '@/components/ui/DialogShell.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const options = computed(() => uiStore.confirmOptions)

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
    :show="uiStore.isConfirmOpen"
    :label="options?.title"
    role="dialog"
    @update:show="uiStore.resolveConfirm(false)"
  >
    <div class="px-4 pb-4 text-white md:p-0">
      <p class="text-base font-semibold">{{ options?.title }}</p>
      <p v-if="options?.message" class="mt-2 text-sm text-white/70">{{ options?.message }}</p>
      <p v-if="options?.detail" class="mt-2 text-xs text-white/50">{{ options?.detail }}</p>

      <div class="mt-5 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <SettingsButton
          preset="pill"
          class="justify-center"
          :label="options?.cancelLabel ?? 'Cancel'"
          @click="uiStore.resolveConfirm(false)"
        />
        <SettingsButton
          preset="pill"
          class="justify-center"
          :tone="options?.tone ?? 'danger'"
          :label="options?.confirmLabel ?? 'Confirm'"
          @click="uiStore.resolveConfirm(true)"
        />
      </div>
    </div>
  </component>
</template>
