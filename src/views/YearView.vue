<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Month } from '@/types'
import useYearsStore from '@/stores/years.ts'
import useUiStore from '@/stores/ui.ts'

import ModalWindow from '@/components/ModalWindow.vue'
import YearSlider from '@/components/YearSlider.vue'
import MainButton from '@/components/MainButton.vue'
import MonthSlider from '@/components/MonthSlider.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'

import { useAuthUtils } from '@/composables/useAuthUtils'

const route = useRoute()
const router = useRouter()
const yearsStore = useYearsStore()
const uiStore = useUiStore()

const { shakeElement } = useAuthUtils()

const isModalOpen = ref(false)
const isNewMonth = ref(true)

const topDayNumber = ref("")
const currentYearNumber = ref(new Date().getFullYear())
const currentMonthNumber = ref(new Date().getMonth() + 1)
const currentMonthRecord = ref<Month>({
  year: currentYearNumber.value,
  month: currentMonthNumber.value,
  backgroundImage: '',
  description: '',
  topDayTimestamp: 0,
})


const monthDescriptionInputId = ref('month-description-input')
const topDayInputId = ref('top-day-input')

let scrollTimeout: number | null = null
const scrollThreshold = 50 // Adjust this value to control sensitivity
const isScrolling = ref(false)

const backgroundGradient = (monthNumber: number) => {
  return {
    1: "from-blue-100 to-blue-700",
    2: "from-indigo-200 to-purple-700",
    3: "from-green-200 to-yellow-700",
    4: "from-pink-200 to-green-500",
    5: "from-green-300 to-yellow-500",
    6: "from-yellow-300 to-green-600",
    7: "from-yellow-400 to-orange-600",
    8: "from-orange-300 to-red-600",
    9: "from-red-300 to-yellow-600",
    10: "from-orange-400 to-amber-800",
    11: "from-amber-700 to-gray-600",
    12: "from-purple-300 to-blue-600",
  }[monthNumber]
}

onMounted(async () => {
  uiStore.disableScroll = true

  currentYearNumber.value = +route.params.year
  if (route.query.month) {
    const monthValue = +route.query.month
    if (monthValue >= 1 && monthValue <= 12) {
      currentMonthNumber.value = monthValue
    }
  }

  const response = await yearsStore.getYear(currentYearNumber.value)
  console.log("response: ", response)
  if (response) {
    for (const month of response) {
      if (month.month === currentMonthNumber.value) {
        currentMonthRecord.value = month
        topDayNumber.value = new Date(month.topDayTimestamp * 1000).getDate().toString()
        break
      }
    }
    isNewMonth.value = false
  } else {
    isNewMonth.value = true
  }

  window.addEventListener('wheel', handleWheel, { passive: false })
})


onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)

  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})


const handleWheel = (e: WheelEvent) => {
  if (isScrolling.value || isModalOpen.value) return

  if (Math.abs(e.deltaY) > scrollThreshold) {
    if (e.deltaY > 0) {
      changeMonth(1)
    } else {
      changeMonth(-1)
    }

    e.preventDefault()
  }
}

const changeMonth = async (direction: number) => {
  if (isScrolling.value) return

  isScrolling.value = true

  let newMonth = currentMonthNumber.value + direction

  if (newMonth > 12) {
    newMonth = 1
    currentYearNumber.value++
  } else if (newMonth < 1) {
    newMonth = 12
    currentYearNumber.value--
  }

  await handleMonthSelect(newMonth)

  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  scrollTimeout = window.setTimeout(() => {
    isScrolling.value = false
  }, 500) as unknown as number
}


const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

function getMonthName(monthNumber: number, locale = 'en-US'): string {
  const date = new Date(currentYearNumber.value, monthNumber)
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
}

async function handleMonthSelect(monthNumber: number) {
  currentMonthNumber.value = monthNumber

  console.log(`Month changed to ${monthNumber} (${getMonthName(monthNumber - 1)})`)

  await router.push({
    path: `/calendar/${currentYearNumber.value}`,
    query: { month: monthNumber.toString() },
  })

  const response = await yearsStore.getMonth(currentYearNumber.value, monthNumber)
  console.log("response: ", response)
  if (response) {
    currentMonthRecord.value = response
    isNewMonth.value = false
    topDayNumber.value = new Date(response.topDayTimestamp * 1000).getDate().toString()
  } else {
    currentMonthRecord.value = {
      year: currentYearNumber.value,
      month: monthNumber,
      backgroundImage: '',
      description: '',
      topDayTimestamp: 0,
    }
    isNewMonth.value = true
    topDayNumber.value = ''
  }
}


const submitMonth = async () => {
  if (!currentMonthRecord.value.description) {
    yearsStore.errorMessage = 'Please enter month description'
    shakeElement(monthDescriptionInputId.value)
    return
  }

  if (!topDayNumber.value
      || !Number.isInteger(+topDayNumber.value)
      || +topDayNumber.value < 1
      || +topDayNumber.value > 31
  ) {
    yearsStore.errorMessage = 'Please enter a valid day number'
    shakeElement(topDayInputId.value)
    return
  }

  currentMonthRecord.value.topDayTimestamp =
    new Date(currentYearNumber.value, currentMonthNumber.value - 1, +topDayNumber.value).getTime() / 1000

  // TODO: upload photo file to cloud in future

  if (isNewMonth.value) {
    await yearsStore.createMonth(currentMonthRecord.value)
    isNewMonth.value = false
  } else {
    await yearsStore.updateMonth(currentMonthRecord.value)
  }

  isModalOpen.value = false
}
</script>

<template>
  <div
    class="relative h-screen flex flex-col bg-gradient-to-b overflow-hidden transition"
    :class="backgroundGradient(currentMonthNumber)"
  >
    <div>
      <div class="flex justify-between">
        <div class="flex items-center gap-4 px-4 py-2">
          <div>
            <p class="text-white text-2xl">{{ getMonthName(currentMonthNumber - 1) }}</p>
          </div>
          <YearSlider
            @click="router.push(`/calendar/${currentYearNumber}`)"
            @prev="currentYearNumber--"
            @next="currentYearNumber++"
            :year="currentYearNumber"
          />
        </div>

        <div class="flex items-center gap-4 px-4 py-2">
          <MainButton>
            <template #default>View Summary</template>
          </MainButton>
          <MainButton @click="openModal" :hide-text="true">
            <template #icon-right>
              <font-awesome-icon icon="gear" />
            </template>
          </MainButton>
        </div>
      </div>

      <div class="flex-grow">
        <div class="flex justify-between p-4">
          <p class="text-white/80 text-center text-2xl font-semibold">
            {{ currentMonthRecord.description || 'No description' }}
          </p>

          <MonthSlider :selectedMonth="currentMonthNumber" @click="handleMonthSelect" />
        </div>
      </div>

      <div class="absolute bottom-18 left-0 right-0 flex justify-between p-4">
        <div>
          <MainButton @click="router.push(`/calendar/${currentYearNumber}/${currentMonthNumber}`)">
            <template #default>Open</template>
            <template #icon-right>
              <font-awesome-icon icon="arrow-right-long" />
            </template>
          </MainButton>
        </div>
        <div>
          <MainButton @click="router.push(`/calendar/${currentYearNumber}/${currentMonthNumber}/${topDayNumber}`)">
            <template #default>Top Day</template>
            <template #icon-right>
              <font-awesome-icon icon="arrow-right-long" />
            </template>
          </MainButton>
        </div>
      </div>
    </div>
  </div>

  <ModalWindow v-model="isModalOpen" title="Month Settings" maxWidth="xl" @close="closeModal">
    <form @submit.prevent="submitMonth">
      <label for="month-description" class="block text-sm font-medium text-white/80 mb-2"
        >Month Description</label
      >
      <AuthInput
        v-model="currentMonthRecord.description"
        icon="address-card"
        placeholder="Description"
        :id="monthDescriptionInputId"
        @update:model-value="yearsStore.errorMessage = ''"
      />

      <label for="top-day" class="block text-sm font-medium text-white/80 mb-2 mt-4">Top Day</label>
      <AuthInput
        v-model="topDayNumber"
        icon="calendar"
        inputmode="numeric"
        placeholder="Day Number"
        :id="topDayInputId"
        @update:model-value="yearsStore.errorMessage = ''"
      />

      <label for="month-photo" class="block text-sm font-medium text-white/80 mb-2 mt-4"
        >Background Photo</label
      >
      <input
        ref="fileInput"
        type="file"
        name="month-photo"
        accept="image/jpeg"
        class="hidden"
      />
      <div
        @click="$refs.fileInput.click()"
        class="w-full h-40 bg-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-500 transition"
      >
        <font-awesome-icon icon="plus" class="text-white/80 text-2xl" />
      </div>

      <p v-if="yearsStore.errorMessage" class="text-red-400 text-sm ml-2 mt-4">
        {{ yearsStore.errorMessage }}
      </p>
    </form>

    <template #footer>
      <div class="flex justify-between gap-2">
        <AuthButton @click="submitMonth">
          <template #default>Save</template>
          <template #icon-right v-if="!yearsStore.isLoading">
            <font-awesome-icon icon="save" />
          </template>
          <template #icon-right v-else>
            <font-awesome-icon icon="circle-notch" class="animate-spin" />
          </template>
        </AuthButton>
      </div>
    </template>
  </ModalWindow>

</template>
