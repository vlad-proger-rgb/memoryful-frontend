<template>
  <div class="flex flex-wrap items-center w-[200px] bg-white/30 px-5 py-2 gap-2 rounded-2xl">
    <div
      v-for="progress in learningProgresses"
      :key="progress.learningItem.id"
      class="flex items-center space-x-2"
    >
      <font-awesome-icon
        :icon="['fab', progress.learningItem.icon]"
        class="text-2xl"
        :title="progress.learningItem.title"
      />
      <div class="text-sm">{{ progress.timeInvolved }} min</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LearningProgress } from '@/types/learning-items'
import { defineProps } from 'vue'

defineProps<{
  learningProgresses: LearningProgress[]
}>()
</script>
