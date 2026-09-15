<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = withDefaults(defineProps<{ prompt: string; align?: 'center' | 'end' }>(), {
  align: 'center',
})

const emit = defineEmits<{ pick: [date: Date] }>()
</script>

<template>
  <!-- The picker's own root is `width: 100%`, which would wrap it inside a flex row. -->
  <div>
    <VueDatePicker
      :model-value="null"
      :time-config="{ enableTimePicker: false }"
      :ui="{ menu: 'day-picker-menu' }"
      :floating="{
        arrow: false,
        offset: 8,
        placement: props.align === 'end' ? 'bottom-end' : 'bottom',
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
        <p class="px-3 pt-3 text-center text-sm text-white/60">{{ prompt }}</p>
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
