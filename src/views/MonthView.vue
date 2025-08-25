<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'

import daysApi from '@/api/days'
import type { DayListItem } from '@/types'

import DayCard from '@/components/day/DayCard.vue'
import DayImage from '@/components/day/DayImage.vue'
import DayInfo from '@/components/day/DayInfo.vue'
import DayStats from '@/components/day/DayStats.vue'
import DayTrackables from '@/components/day/DayTrackables.vue'
import MainButton from '@/components/MainButton.vue'

const uiStore = useUiStore()

function getDaysInMonth(year: number, month: number) {
  // Note: month is 0-indexed (0 = January, 11 = December)
  // Passing 0 as the day parameter gets the last day of the previous month
  // So we use month + 1 to get the last day of the current month
  return new Date(year, month + 1, 0).getDate()
}

const DEFAULT_CITY = {
  id: '0',
  country: {
    id: '0',
    name: 'Not specified',
    code: 'N/A',
  },
  name: 'Not specified',
}

const days = ref<DayListItem[]>([])
const route = useRoute()
const router = useRouter()

async function fetchDaysForMonth() {
  // Get year and month from route params or use current date
  const year = Number(route.params.year) || new Date().getFullYear()
  const month = Number(route.params.month) - 1 || new Date().getMonth()

  // Create dates in local timezone
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

  // Convert to UTC timestamps (in seconds) for the API
  const startTimestamp = Math.floor(startOfMonth.getTime() / 1000)
  const endTimestamp = Math.floor(endOfMonth.getTime() / 1000)

  console.log('Fetching days from', startOfMonth.toISOString(), 'to', endOfMonth.toISOString())

  const response = await daysApi.getDays({
    filters: {
      createdAfter: startTimestamp,
      createdBefore: endTimestamp,
    },
  })

  const fetchedDays: DayListItem[] = response.data || []
  console.log('Fetched days:', fetchedDays)

  // Create a map of day numbers to day items
  const dayMap = new Map<number, DayListItem>()
  for (const day of fetchedDays) {
    // Convert API timestamp (seconds) to milliseconds for frontend
    const timestampMs = day.timestamp * 1000
    const date = new Date(timestampMs)

    // Create a new object to avoid mutating the original
    dayMap.set(date.getDate(), {
      ...day,
      timestamp: timestampMs,
      exists: true,
    })
  }

  const daysInMonth = getDaysInMonth(year, month)
  const result: DayListItem[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    if (dayMap.has(d)) {
      result.push(dayMap.get(d)!)
    } else {
      const date = new Date(year, month, d)
      result.push({
        timestamp: date.getTime(),
        description: undefined,
        steps: 0,
        starred: false,
        mainImage: undefined,
        city: DEFAULT_CITY,
        trackableProgresses: [],
        exists: false,
      })
    }
  }
  days.value = result
  console.log(days.value)
}

onMounted(() => {
  uiStore.disableScroll = false
  fetchDaysForMonth()
})

const toggleStarred = async (date: string | number) => {
  console.log('toggleStarred', date)
  const day = days.value.find((day) => day.timestamp === date)
  if (day && day.exists) {
    day.starred = !day.starred
    await daysApi.toggleStarred(day.timestamp / 1000)
  } else {
    console.error('Day not found')
  }
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden">
    <img
      src="/src/assets/img/bg.jpg"
      class="fixed inset-0 w-full h-full object-cover z-0 blur-sm brightness-75"
      alt="background"
    />
    <div class="relative z-10 flex flex-col items-center pt-24 pb-8 px-2 max-w-2xl mx-auto">
      <div v-for="(day, idx) in days" :key="idx" class="w-full">
        <DayCard>
          <template #image>
            <DayImage :src="day.mainImage" :alt="day.mainImage" size="small" />
          </template>
          <template #info>
            <DayInfo
              :date="day.timestamp"
              :description="day.description"
              :starred="day.starred"
              :exists="day.exists"
              @toggle-starred="toggleStarred(day.timestamp)"
            />
          </template>
          <template #stats>
            <DayStats :steps="day.steps" :city="day.city.name" />
          </template>
          <template #learning-items>
            <DayTrackables
              v-if="day.trackableProgresses && day.trackableProgresses.length > 0"
              :trackable-progresses="day.trackableProgresses"
            />
            <div v-else>No trackable items</div>
          </template>
          <template #open>
            <MainButton
              class="ml-4 whitespace-nowrap"
              @click="
                router.push(
                  `/calendar/${new Date(day.timestamp).getFullYear()}/${
                    new Date(day.timestamp).getMonth() + 1
                  }/${new Date(day.timestamp).getDate()}`,
                )
              "
            >
              <template #default>Open</template>
              <template #icon-right>
                <font-awesome-icon icon="arrow-right-long" />
              </template>
            </MainButton>
          </template>
        </DayCard>
      </div>
    </div>
  </div>
</template>
