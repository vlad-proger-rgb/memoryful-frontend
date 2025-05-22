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
import DayLearnings from '@/components/day/DayLearnings.vue'
import MainButton from '@/components/MainButton.vue'

const uiStore = useUiStore()

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

const DEFAULT_CITY = {
  id: '0',
  countryId: '0',
  name: 'Not specified',
}

const days = ref<DayListItem[]>([])
const route = useRoute()
const router = useRouter()
async function fetchDaysForMonth() {
  const year = Number(route.params.year) || new Date().getFullYear()
  const month = Number(route.params.month) || new Date().getMonth() + 1

  // const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0).getTime() / 1000 // seconds
  // const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999).getTime() / 1000 // seconds
  // const filters = {
  //   timestamp_gte: String(startOfMonth),
  //   timestamp_lte: String(endOfMonth),
  // }
  const response = await daysApi.getDays({
    limit: 10,
    // filters,
  })
  console.log(response)
  const fetchedDays: DayListItem[] = response.data || []

  const dayMap = new Map<number, DayListItem>()
  for (const day of fetchedDays) {
    day.timestamp = day.timestamp * 1000
    day.exists = true
    const date = new Date(day.timestamp)
    dayMap.set(date.getDate(), day)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const result: DayListItem[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    if (dayMap.has(d)) {
      result.push(dayMap.get(d)!)
    } else {
      const date = new Date(year, month - 1, d)
      result.push({
        timestamp: date.getTime(),
        description: undefined,
        steps: 0,
        starred: false,
        mainImage: undefined,
        city: DEFAULT_CITY,
        learningProgresses: [],
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
            <DayImage :src="day.mainImage" :alt="day.mainImage" />
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
            <DayLearnings
              v-if="day.learningProgresses && day.learningProgresses.length > 0"
              :learning-progresses="day.learningProgresses"
            />
            <div v-else>No learning items</div>
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
