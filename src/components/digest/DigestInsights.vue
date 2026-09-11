<script setup lang="ts">
import DigestEntry from '@/components/digest/DigestEntry.vue'
import type { InsightInDB } from '@/types'

defineProps<{
  observations: InsightInDB[]
  suggestions: InsightInDB[]
  emptyNoun: string
}>()
</script>

<template>
  <div class="space-y-6">
    <section
      v-for="group in [
        { title: 'Insights', tone: 'insight' as const, items: observations },
        { title: 'Suggestions', tone: 'suggestion' as const, items: suggestions },
      ]"
      :key="group.title"
    >
      <div class="mb-2.5 flex items-center gap-2">
        <h3 class="text-sm font-semibold text-white/90">{{ group.title }}</h3>
        <span
          class="min-w-5 rounded-full bg-white/8 px-1.5 py-px text-center text-[11px] font-medium text-white/50"
        >
          {{ group.items.length }}
        </span>
      </div>

      <p v-if="!group.items.length" class="text-sm text-white/35">
        Nothing for {{ emptyNoun }} yet.
      </p>

      <div v-else class="space-y-2">
        <DigestEntry
          v-for="item in group.items"
          :key="item.id"
          :tone="group.tone"
          :icon="item.icon"
          :title="item.description"
          :timestamp="item.timestamp"
          :body="item.content"
        />
      </div>
    </section>
  </div>
</template>
