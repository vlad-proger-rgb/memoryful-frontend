<script setup lang="ts">
import { computed } from 'vue'

import DigestEntry from '@/components/digest/DigestEntry.vue'
import type { WeekDigestInDB } from '@/types'
import { formatDate } from '@/utils/dates'

const props = defineProps<{ digest: WeekDigestInDB }>()

const paragraphs = computed(() => props.digest.summary.split(/\n{2,}/).filter((p) => p.trim()))

const generatedAt = computed(() => formatDate(new Date(props.digest.updatedAt)))
</script>

<template>
  <div class="space-y-5">
    <div class="space-y-3">
      <p
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        class="text-[15px] leading-relaxed text-white/80"
      >
        {{ paragraph }}
      </p>
    </div>

    <p class="flex flex-wrap items-center gap-x-2 text-[11px] text-white/45">
      <span>
        Generated {{ generatedAt }} from {{ digest.sourceDayCount }}
        {{ digest.sourceDayCount === 1 ? 'entry' : 'entries' }}
      </span>
    </p>

    <div v-if="digest.sections.length" class="space-y-2 border-t border-white/8 pt-5">
      <DigestEntry
        v-for="(section, index) in digest.sections"
        :key="index"
        tone="thread"
        :icon="section.icon"
        :title="section.description"
        :body="section.content"
      />
    </div>
  </div>
</template>
