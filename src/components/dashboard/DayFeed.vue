<script setup lang="ts">
import { useRouter } from 'vue-router'

import DayPickerDropdown from '@/components/dashboard/DayPickerDropdown.vue'
import DayCard from '@/components/day/DayCard.vue'
import DayImage from '@/components/day/DayImage.vue'
import DayInfo from '@/components/day/DayInfo.vue'
import DayStats from '@/components/day/DayStats.vue'
import DayTrackables from '@/components/day/DayTrackables.vue'
import MainButton from '@/components/MainButton.vue'
import { DAY_FEED_PAGE_SIZE } from '@/composables'
import type { DayListItem } from '@/types'
import { dayPath } from '@/utils/routes'

defineProps<{
  days: DayListItem[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  errorMessage: string
  isFiltered: boolean
}>()

const emit = defineEmits<{ loadMore: []; toggleStarred: [day: DayListItem] }>()

const router = useRouter()

const openDay = (date: Date | number) => router.push(dayPath(new Date(date)))
</script>

<template>
  <section>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-lg font-semibold md:text-xl">
        {{ isFiltered ? 'Search results' : 'Latest days' }}
      </h1>
      <!-- The merged view lost the calendar's "jump to a specific day"; this is it. -->
      <DayPickerDropdown align="end" prompt="Which day do you want to see?" @pick="openDay">
        <button
          type="button"
          class="inline-flex min-h-8 cursor-pointer items-center rounded-lg border border-white/20 px-2.5 py-1 text-xs text-white/80 transition-all duration-150 hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          <font-awesome-icon icon="calendar-day" class="mr-1.5 text-[11px]" />
          Go to date
        </button>
      </DayPickerDropdown>
    </div>

    <div v-if="errorMessage" class="glass-panel border-red-400/40 px-4 py-3 text-sm">
      {{ errorMessage }}
    </div>

    <div v-else-if="isLoading" class="py-12 text-center">
      <font-awesome-icon icon="spinner" class="animate-spin text-2xl text-white/80" />
      <p class="mt-3 text-sm text-white/70">Loading your days...</p>
    </div>

    <div
      v-else-if="!days.length"
      class="rounded-xl bg-black/35 px-6 py-10 text-center backdrop-blur-sm"
    >
      <font-awesome-icon
        :icon="isFiltered ? 'magnifying-glass' : 'book'"
        class="mb-3 text-3xl text-white/40"
      />
      <p class="mb-1 text-base text-white/80">
        {{ isFiltered ? 'No days found' : 'Nothing written yet' }}
      </p>
      <p class="text-sm text-white/50">
        {{ isFiltered ? 'Try another keyword, or widen the filters' : 'Start with a new entry' }}
      </p>
    </div>

    <template v-else>
      <DayCard
        v-for="day in days"
        :key="day.timestamp"
        class="transition-[background-color,box-shadow] duration-250 hover:bg-white/30 hover:shadow-[0_16px_36px_-18px_rgba(0,0,0,0.85)]"
      >
        <template #image>
          <DayImage
            :src="day.mainImage"
            alt=""
            class="w-24 h-24 md:w-64 md:h-48 object-cover rounded-2xl shrink-0"
          />
        </template>
        <template #info>
          <DayInfo
            :date="day.timestamp"
            :description="day.description"
            :starred="day.starred"
            :exists="day.exists"
            @toggle-starred="emit('toggleStarred', day)"
          />
        </template>
        <template #stats>
          <DayStats :steps="day.steps ?? 0" :city="day.city?.name || 'Not specified'" />
        </template>
        <template #learning-items>
          <DayTrackables
            v-if="day.trackableProgresses?.length"
            :trackable-progresses="day.trackableProgresses"
          />
          <div v-else>No trackable items</div>
        </template>
        <template #open>
          <MainButton class="whitespace-nowrap" @click="openDay(day.timestamp)">
            <template #default>Open</template>
            <template #icon-right>
              <font-awesome-icon icon="arrow-right-long" />
            </template>
          </MainButton>
        </template>
      </DayCard>
    </template>

    <div v-if="days.length && hasMore" class="flex justify-center py-4">
      <button
        type="button"
        class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-white/18 bg-white/8 px-[18px] py-2 text-sm text-white/85 transition-all duration-150 enabled:hover:border-white/35 enabled:hover:bg-white/16 enabled:hover:text-white disabled:cursor-default disabled:opacity-70"
        :disabled="isLoadingMore"
        @click="emit('loadMore')"
      >
        <font-awesome-icon
          :icon="isLoadingMore ? 'spinner' : 'angle-down'"
          :class="{ 'animate-spin': isLoadingMore }"
        />
        {{ isLoadingMore ? 'Loading...' : `Load ${DAY_FEED_PAGE_SIZE} more` }}
      </button>
    </div>
    <p v-else-if="days.length" class="py-6 text-center text-sm text-white/50">
      That's every day so far.
    </p>
  </section>
</template>
