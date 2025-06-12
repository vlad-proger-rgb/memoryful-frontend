<script setup lang="ts">
import DayEntry from './DayEntry.vue'
import { marked } from 'marked'

defineProps<{
  label?: string
  text?: string
  iconLeft?: string[]
  iconRight?: string[]
  small?: boolean
  markdown?: boolean
}>()
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <p class="text-white/70 text-sm font-medium mb-1">{{ label }}</p>
    <DayEntry :small="small">
      <template #icon-left>
        <font-awesome-icon v-if="iconLeft" :icon="iconLeft" class="text-white/70" />
      </template>
      <template v-if="text && !markdown">
        <div class="text-white">{{ text }}</div>
      </template>
      <template v-else-if="text && markdown">
        <div
          class="text-white prose prose-invert max-w-none markdown-content"
          v-html="marked(text)"
        ></div>
      </template>
      <template #icon-right>
        <font-awesome-icon v-if="iconRight" :icon="iconRight" class="ml-auto text-white/70" />
      </template>
    </DayEntry>
  </div>
</template>
