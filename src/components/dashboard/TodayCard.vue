<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import useAiChatStore from '@/stores/aiChat'
import type { DayListItem } from '@/types'
import { dayPath } from '@/utils/routes'

const props = defineProps<{ day: DayListItem }>()

const emit = defineEmits<{ summary: [] }>()

const aiChatStore = useAiChatStore()

const date = computed(() => new Date(props.day.timestamp))
const label = computed(() =>
  date.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
)

const discuss = () => {
  aiChatStore.draft = `Let's talk about my day, ${date.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })}.`
  aiChatStore.open()
}

const actions = computed(() => [
  { label: 'Open', icon: 'book-open', to: dayPath(date.value) },
  { label: 'Discuss', icon: 'comments', run: discuss },
  { label: 'AI summary', icon: 'lightbulb', run: () => emit('summary') },
])
</script>

<template>
  <div class="glass-panel p-3">
    <div class="flex items-center justify-between">
      <p class="text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase">Today</p>
      <span class="text-[11px] text-white/50">{{ label }}</span>
    </div>
    <p class="mt-2 line-clamp-2 text-sm text-white/70">
      {{ day.description || 'Written, no description yet' }}
    </p>
    <div class="mt-3 flex flex-col gap-2">
      <component
        :is="action.to ? RouterLink : 'button'"
        v-for="action in actions"
        :key="action.label"
        :to="action.to"
        :type="action.to ? undefined : 'button'"
        class="flex min-h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-white/12 bg-white/8 px-3 py-2 text-sm text-white/90 transition-all duration-150 hover:border-white/30 hover:bg-white/16"
        @click="action.run?.()"
      >
        <font-awesome-icon :icon="action.icon" class="text-white/60" />
        {{ action.label }}
        <font-awesome-icon icon="angle-right" class="ml-auto text-white/50" />
      </component>
    </div>
  </div>
</template>
