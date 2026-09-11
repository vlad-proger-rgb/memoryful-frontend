<script setup lang="ts">
import { computed, ref } from 'vue'

import { weekFromIso } from '@/utils/dates'

const props = defineProps<{
  /** `weekStart` of every week that already has a digest. */
  taken: string[]
  busy: boolean
}>()

const emit = defineEmits<{ generate: [string] }>()

const isOpen = ref(false)
const day = ref('')

const week = computed(() => (day.value ? weekFromIso(day.value) : null))
const exists = computed(() => !!week.value && props.taken.includes(week.value.startIso))

const submit = () => {
  if (week.value && !exists.value && !props.busy) emit('generate', week.value.startIso)
}
</script>

<template>
  <div class="border-t border-white/8 pt-3">
    <button
      type="button"
      class="flex w-full cursor-pointer items-center gap-2 text-[13px] text-white/45 transition hover:text-white/80"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <font-awesome-icon icon="wand-magic-sparkles" class="w-4 shrink-0 text-xs" />
      Generate a week
      <font-awesome-icon
        icon="chevron-down"
        class="ml-auto shrink-0 text-[10px] transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div v-if="isOpen" class="mt-2.5 space-y-2">
      <!-- Any day in the target week; the backend snaps it to that Monday. -->
      <input
        v-model="day"
        type="date"
        class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/85 outline-none [color-scheme:dark] focus:border-white/25 md:text-sm"
        aria-label="Any day in the week to digest"
        @keydown.enter="submit"
      />

      <button
        type="button"
        class="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-default disabled:opacity-40"
        :disabled="!week || exists || busy"
        @click="submit"
      >
        <font-awesome-icon
          :icon="busy ? 'spinner' : 'wand-magic-sparkles'"
          class="text-xs"
          :class="{ 'animate-spin': busy }"
        />
        {{ busy ? 'Generating…' : 'Generate' }}
      </button>

      <p v-if="week" class="text-[11px] leading-relaxed text-white/40">
        {{ exists ? `${week.label} already has one.` : `Covers ${week.label}.` }}
      </p>
    </div>
  </div>
</template>
