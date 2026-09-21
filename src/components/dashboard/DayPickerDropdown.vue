<script setup lang="ts">
import { ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = withDefaults(
  defineProps<{
    prompt: string
    align?: 'center' | 'start' | 'end'
    selected?: Date | null
    minDate?: Date | null
    maxDate?: Date | null
    shortcuts?: { date: Date; label: string }[]
  }>(),
  { align: 'center', selected: null, minDate: null, maxDate: null, shortcuts: () => [] },
)

const emit = defineEmits<{ pick: [date: Date] }>()

const picker = ref<InstanceType<typeof VueDatePicker> | null>(null)

const pickShortcut = (date: Date) => {
  picker.value?.closeMenu()
  emit('pick', date)
}
</script>

<template>
  <!-- The picker's own root is `width: 100%`, which would wrap it inside a flex row. -->
  <div>
    <VueDatePicker
      ref="picker"
      :model-value="props.selected"
      :min-date="props.minDate ?? undefined"
      :max-date="props.maxDate ?? undefined"
      :time-config="{ enableTimePicker: false }"
      :ui="{ menu: 'day-picker-menu' }"
      :floating="{
        arrow: false,
        offset: 8,
        placement: props.align === 'center' ? 'bottom' : `bottom-${props.align}`,
      }"
      :teleport="true"
      auto-apply
      dark
      @date-click="emit('pick', $event)"
    >
      <template #trigger>
        <slot />
      </template>
      <template #menu-header>
        <div class="px-3 pt-3">
          <p class="text-center text-sm text-white/60">{{ prompt }}</p>
          <div v-if="props.shortcuts.length" class="mt-2 flex gap-2">
            <button
              v-for="shortcut in props.shortcuts"
              :key="shortcut.label"
              type="button"
              class="min-h-9 flex-1 cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/12 hover:text-white"
              @click="pickShortcut(shortcut.date)"
            >
              {{ shortcut.label }}
            </button>
          </div>
        </div>
      </template>
    </VueDatePicker>
  </div>
</template>

<style>
/* Teleported to body, so a scoped selector never reaches it. */
.day-picker-menu.dp__theme_dark {
  --dp-background-color: rgba(20, 20, 36, 0.9);
  --dp-text-color: #fff;
  --dp-hover-color: rgba(255, 255, 255, 0.12);
  --dp-hover-text-color: #fff;
  --dp-primary-color: #8b5cf6;
  --dp-primary-text-color: #fff;
  --dp-border-color: rgba(255, 255, 255, 0.2);
  --dp-menu-border-color: rgba(255, 255, 255, 0.2);
  --dp-icon-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
</style>
