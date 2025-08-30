<template>
  <div class="flex flex-wrap items-center w-[200px] bg-white/30 px-5 py-2 gap-2 rounded-2xl">
    <div
      v-for="progress in trackableProgresses"
      :key="progress.trackableItem.id"
      class="flex items-center space-x-2"
    >
      <font-awesome-icon
        v-if="progress.trackableItem.icon"
        :icon="getIcon(progress.trackableItem.icon)"
        class="text-2xl"
        :title="`${progress.trackableItem.title}${progress.trackableItem.description ? ` (${progress.trackableItem.description})` : ''}`"
      />
      <div class="text-sm">{{ progress.value }} min</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DayTrackableProgress } from '@/types/day-trackable-progress'
import { getIcon } from '@/plugins/fontawesome'

defineProps<{
  trackableProgresses: DayTrackableProgress[]
}>()
</script>
