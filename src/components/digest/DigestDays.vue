<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import insightsApi from '@/api/insights'
import DigestEntry from '@/components/digest/DigestEntry.vue'
import type { DigestDay } from '@/composables'
import type { DayListItem, InsightInDB } from '@/types'
import { dayPath } from '@/utils/routes'

const props = defineProps<{
  weekDays: DigestDay[]
  days: DayListItem[]
}>()

const emit = defineEmits<{ navigate: [] }>()

const selected = ref<DigestDay | null>(null)
const items = ref<InsightInDB[]>([])
const isLoading = ref(false)

const observations = computed(() => items.value.filter((i) => i.kind === 'observation'))
const suggestions = computed(() => items.value.filter((i) => i.kind === 'suggestion'))

const selectedEntry = computed(() =>
  props.days.find((day) => day.timestamp === selected.value?.entry?.timestamp),
)

const longLabel = (day: DigestDay) =>
  day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const openDay = async (day: DigestDay) => {
  selected.value = day
  if (!day.entry) {
    items.value = []
    return
  }

  isLoading.value = true
  try {
    const response = await insightsApi.getInsights({
      limit: 50,
      timestamp: Math.round(day.entry.timestamp / 1000),
    })
    items.value = response.data || []
  } catch {
    items.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.weekDays,
  () => {
    selected.value = null
    items.value = []
  },
)
</script>

<template>
  <div class="relative">
    <section class="grid grid-cols-7 gap-1.5">
      <button
        v-for="cell in weekDays"
        :key="cell.iso"
        type="button"
        class="relative flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border py-2.5 transition"
        :class="[
          cell.entry
            ? 'border-white/15 bg-white/8 text-white hover:border-white/30'
            : 'border-white/6 bg-white/2 text-white/25 hover:border-white/15',
          selected?.iso === cell.iso ? 'ring-1 ring-white/40' : '',
        ]"
        :aria-label="`${cell.iso} — ${cell.entry ? 'written' : 'nothing written'}`"
        @click="openDay(cell)"
      >
        <span class="text-[10px] tracking-wider uppercase opacity-60">{{ cell.letter }}</span>
        <span class="text-[15px] leading-none font-semibold">{{ cell.number }}</span>
        <font-awesome-icon
          v-if="cell.entry?.starred"
          icon="star"
          class="absolute top-1 right-1.5 text-[8px] text-amber-400/80"
        />
        <span v-if="cell.isToday" class="absolute bottom-1 size-1 rounded-full bg-current" />
      </button>
    </section>

    <p v-if="!selected" class="mt-5 text-sm text-white/35">
      Pick a day to see what the AI made of it.
    </p>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0 translate-x-4"
      leave-to-class="opacity-0 translate-x-4"
    >
      <section
        v-if="selected"
        class="relative mt-5 rounded-xl border border-white/10 bg-white/4 p-4"
      >
        <!-- Keyed on the day so switching days crossfades instead of swapping text. -->
        <Transition
          enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
          leave-active-class="absolute inset-x-4 top-4 transition duration-150 ease-in motion-reduce:transition-none"
          enter-from-class="translate-x-3 opacity-0"
          leave-to-class="-translate-x-3 opacity-0"
        >
          <div :key="selected.iso">
            <header class="mb-3 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] tracking-[0.08em] text-white/35 uppercase">Day</p>
                <h3 class="truncate text-base font-semibold">{{ longLabel(selected) }}</h3>
                <p
                  v-if="selectedEntry?.description"
                  class="mt-0.5 truncate text-[13px] text-white/50"
                >
                  {{ selectedEntry.description }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="Close the day"
                @click="selected = null"
              >
                <font-awesome-icon icon="xmark" class="text-xs" />
              </button>
            </header>

            <RouterLink
              :to="dayPath(selected.iso)"
              class="mb-3 flex min-h-10 w-full items-center gap-2.5 rounded-lg border border-white/12 bg-white/8 px-3.5 text-sm text-white/85 transition hover:bg-white/14 hover:text-white"
              @click="emit('navigate')"
            >
              <font-awesome-icon icon="book-open" class="text-white/50" />
              Open this day
              <font-awesome-icon icon="arrow-right" class="ml-auto text-white/40" />
            </RouterLink>

            <div v-if="isLoading" class="space-y-2">
              <span
                v-for="n in 2"
                :key="n"
                class="block h-12 animate-pulse rounded-lg bg-white/5"
              />
            </div>

            <p v-else-if="!selected.entry" class="text-sm text-white/35">
              Nothing written this day.
            </p>

            <p v-else-if="!items.length" class="text-sm text-white/35">
              This day has not been analyzed yet.
            </p>

            <div v-else class="space-y-2">
              <DigestEntry
                v-for="item in [...observations, ...suggestions]"
                :key="item.id"
                :tone="item.kind === 'suggestion' ? 'suggestion' : 'insight'"
                :icon="item.icon"
                :title="item.description"
                :body="item.content"
              />
            </div>
          </div>
        </Transition>
      </section>
    </Transition>
  </div>
</template>
