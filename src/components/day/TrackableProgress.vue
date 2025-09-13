<script setup lang="ts">
import BaseBox from '@/components/ui/BaseBox.vue'
import { getIcon } from '@/plugins/fontawesome'

defineProps({
  progress: {
    type: Object,
    required: true,
  },
})

const formatValue = (value: number, type: string) => {
  if (type === 'percentage') return `${Math.round(value)}%`
  return value
}

const getProgressWidth = (value: number, type: string) => {
  if (type === 'percentage') return `${Math.min(100, Math.max(0, value))}%`
  return '100%'
}
</script>

<template>
  <BaseBox class="hover:bg-white/10 transition-colors">
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <font-awesome-icon
            v-if="progress.type.icon"
            :icon="getIcon(progress.type.icon)"
            class="text-white/70"
          />
        </div>
        <h4 class="text-white font-medium">{{ progress.type.name }}</h4>
      </div>

      <div class="space-y-3">
        <div
          v-for="progressItem in progress.progresses"
          :key="progressItem.trackableItem.id"
          class="space-y-1.5"
        >
          <div class="flex justify-between items-center">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white/90 truncate">
                {{ progressItem.trackableItem.title || 'Untitled' }}
              </div>
              <div v-if="progressItem.description" class="text-xs text-white/50 truncate">
                {{ progressItem.description }}
              </div>
            </div>
            <div class="ml-2 text-sm font-medium whitespace-nowrap">
              {{ formatValue(progressItem.value, progress.type.valueType) }}
            </div>
          </div>

          <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              :style="{
                width: getProgressWidth(progressItem.value, progress.type.valueType),
              }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="!progress.progresses?.length" class="text-center py-2 text-white/50 text-sm">
        No progress recorded yet
      </div>
    </div>
  </BaseBox>
</template>
