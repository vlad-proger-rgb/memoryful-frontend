<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, onBeforeUnmount as onBeforeUnmountVue } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Month } from '@/types'
import useUiStore from '@/stores/ui.ts'
import yearApi from '@/api/years'

import ModalWindow from '@/components/ModalWindow.vue'
import YearSlider from '@/components/YearSlider.vue'
import MainButton from '@/components/MainButton.vue'
import MonthSlider from '@/components/MonthSlider.vue'
import AuthButton from '@/components/auth/AuthButton.vue'

import { useAuthUtils, useStorageUpload, useStorageResolve } from '@/composables'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const { shakeElement } = useAuthUtils()
const { uploadToStorage } = useStorageUpload()
const { resolveStorageSrc } = useStorageResolve()

const backgroundUrl = ref<string | null>(null)
const isBackgroundVideo = ref(false)

const computeIsVideo = (src: string) => {
  const lower = src.toLowerCase()
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.m4v') ||
    lower.endsWith('.avi')
  )
}

const isModalOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedBackgroundFile = ref<File | null>(null)
const selectedBackgroundPreviewUrl = ref<string | null>(null)
const isSelectedBackgroundPreviewVideo = ref(false)
const isNewMonth = ref(true)

const isLoading = ref(false)
const errorMessage = ref('')

const topDayNumber = ref('')
const currentYearNumber = ref(new Date().getFullYear())
const currentMonthNumber = ref(new Date().getMonth() + 1)
const currentMonthRecord = ref<Month>({
  year: currentYearNumber.value,
  month: currentMonthNumber.value,
  backgroundImage: '',
  description: '',
  topDayTimestamp: 0,
})

watch(
  () => currentMonthRecord.value.backgroundImage,
  async (next) => {
    backgroundUrl.value = await resolveStorageSrc(next)
    isBackgroundVideo.value = !!next && computeIsVideo(next)
  },
  { immediate: true },
)

const resetMonth = (monthNumber: number) => {
  currentMonthRecord.value = {
    year: currentYearNumber.value,
    month: monthNumber,
    backgroundImage: '',
    description: '',
    topDayTimestamp: 0,
  }
  isNewMonth.value = true
  topDayNumber.value = ''
  selectedBackgroundFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const handleBackgroundSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedBackgroundFile.value = input.files?.[0] || null
}

watch(
  () => selectedBackgroundFile.value,
  (next) => {
    if (selectedBackgroundPreviewUrl.value) {
      URL.revokeObjectURL(selectedBackgroundPreviewUrl.value)
      selectedBackgroundPreviewUrl.value = null
    }

    if (!next) {
      isSelectedBackgroundPreviewVideo.value = false
      return
    }

    selectedBackgroundPreviewUrl.value = URL.createObjectURL(next)
    isSelectedBackgroundPreviewVideo.value = next.type.startsWith('video/')
  },
)

onBeforeUnmountVue(() => {
  if (selectedBackgroundPreviewUrl.value) {
    URL.revokeObjectURL(selectedBackgroundPreviewUrl.value)
    selectedBackgroundPreviewUrl.value = null
  }
})

const monthDescriptionInputId = ref('month-description-input')
const topDayInputId = ref('top-day-input')

let scrollTimeout: number | null = null
const scrollThreshold = 50 // Adjust this value to control sensitivity
const isScrolling = ref(false)

const backgroundGradient = (monthNumber: number) => {
  return {
    1: 'from-blue-100 to-blue-700',
    2: 'from-indigo-200 to-purple-700',
    3: 'from-green-200 to-yellow-700',
    4: 'from-pink-200 to-green-500',
    5: 'from-green-300 to-yellow-500',
    6: 'from-yellow-300 to-green-600',
    7: 'from-yellow-400 to-orange-600',
    8: 'from-orange-300 to-red-600',
    9: 'from-red-300 to-yellow-600',
    10: 'from-orange-400 to-amber-800',
    11: 'from-amber-700 to-gray-600',
    12: 'from-purple-300 to-blue-600',
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

  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await yearApi.getYear(currentYearNumber.value)
    const months = response.data ?? []
    let found = false
    for (const month of months) {
      if (month.month === currentMonthNumber.value) {
        currentMonthRecord.value = month
        topDayNumber.value = new Date(month.topDayTimestamp * 1000).getDate().toString()
        found = true
        break
      }
    }

    if (found) {
      isNewMonth.value = false
    } else {
      resetMonth(currentMonthNumber.value)
    }
  } catch (e: unknown) {
    const maybeErr = e as { code?: number; msg?: string }
    errorMessage.value = maybeErr?.msg || 'Failed to load year'
    resetMonth(currentMonthNumber.value)
  } finally {
    isLoading.value = false
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

  selectedBackgroundFile.value = null
  if (fileInput.value) fileInput.value.value = ''

  await router.push({
    path: `/calendar/${currentYearNumber.value}`,
    query: { month: monthNumber.toString() },
  })

  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await yearApi.getMonth(currentYearNumber.value, monthNumber)
    if (response.data) {
      currentMonthRecord.value = response.data
      isNewMonth.value = false
      topDayNumber.value = new Date(response.data.topDayTimestamp * 1000).getDate().toString()
      return
    }
  } catch (e: unknown) {
    const maybeErr = e as { code?: number; msg?: string }
    if (maybeErr?.code !== 404) {
      errorMessage.value = maybeErr?.msg || 'Failed to load month'
      return
    }
  } finally {
    isLoading.value = false
  }

  resetMonth(monthNumber)
}

const submitMonth = async () => {
  errorMessage.value = ''
  if (!currentMonthRecord.value.description) {
    errorMessage.value = 'Please enter month description'
    shakeElement(monthDescriptionInputId.value)
    return
  }

  if (
    !topDayNumber.value ||
    !Number.isInteger(+topDayNumber.value) ||
    +topDayNumber.value < 1 ||
    +topDayNumber.value > 31
  ) {
    errorMessage.value = 'Please enter a valid day number'
    shakeElement(topDayInputId.value)
    return
  }

  currentMonthRecord.value.topDayTimestamp =
    new Date(currentYearNumber.value, currentMonthNumber.value - 1, +topDayNumber.value).getTime() /
    1000

  const file = selectedBackgroundFile.value || fileInput.value?.files?.[0]
  if (file) {
    try {
      const objectKey = await uploadToStorage({
        file,
        intent: 'month_image',
        year: currentYearNumber.value,
        month: currentMonthNumber.value,
      })
      currentMonthRecord.value.backgroundImage = objectKey
      selectedBackgroundFile.value = null
      if (fileInput.value) fileInput.value.value = ''
    } catch (e: unknown) {
      console.error('Failed to upload month background:', e)
      const maybeErr = e as { message?: string }
      errorMessage.value = maybeErr?.message || 'Failed to upload month background'
      return
    }
  }

  isLoading.value = true
  try {
    if (isNewMonth.value) {
      const res = await yearApi.createMonth(currentMonthRecord.value)
      if (res.code !== 200) {
        errorMessage.value = res.msg || 'Failed to create month'
        return
      }
      isNewMonth.value = false
      uiStore.showToast('Month created successfully', 'success')
    } else {
      const res = await yearApi.updateMonth(currentMonthRecord.value)
      if (res.code !== 200) {
        errorMessage.value = res.msg || 'Failed to update month'
        return
      }
      uiStore.showToast('Month updated successfully', 'success')
    }
  } catch (e: unknown) {
    const maybeErr = e as { msg?: string }
    errorMessage.value = maybeErr?.msg || 'Request failed'
    return
  } finally {
    isLoading.value = false
  }

  isModalOpen.value = false
}
</script>

<template>
  <div
    class="relative h-screen flex flex-col overflow-hidden transition"
  >
    <video
      v-if="backgroundUrl && isBackgroundVideo"
      class="absolute inset-0 w-full h-full object-cover z-0 blur-[3px] brightness-75"
      :src="backgroundUrl"
      autoplay
      muted
      loop
      playsinline
    />
    <img
      v-else-if="backgroundUrl"
      class="absolute inset-0 w-full h-full object-cover z-0 blur-[3px] brightness-75"
      :src="backgroundUrl"
      alt="background"
    />
    <div
      class="absolute inset-0 z-10 bg-gradient-to-b"
      :class="backgroundGradient(currentMonthNumber)"
      style="opacity: 0.45"
    />

    <div class="relative z-20 flex flex-col flex-1 min-h-0">
      <div class="flex justify-between mt-3">
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

      <div class="flex-1 min-h-0">
        <div class="flex justify-between p-4">
          <p class="text-white/80 text-center text-2xl font-semibold">
            {{ currentMonthRecord.description || 'No description' }}
          </p>

          <div class="relative z-10 max-h-[calc(100vh-14rem)] overflow-y-auto">
            <MonthSlider :selectedMonth="currentMonthNumber" @click="handleMonthSelect" />
          </div>
        </div>
      </div>

      <div class="absolute bottom-18 left-0 right-0 z-30 flex justify-between p-4">
        <div>
          <MainButton @click="router.push(`/calendar/${currentYearNumber}/${currentMonthNumber}`)">
            <template #default>Open</template>
            <template #icon-right>
              <font-awesome-icon icon="arrow-right-long" />
            </template>
          </MainButton>
        </div>
        <div>
          <MainButton
            @click="
              router.push(`/calendar/${currentYearNumber}/${currentMonthNumber}/${topDayNumber}`)
            "
          >
            <template #default>Top Day</template>
            <template #icon-right>
              <font-awesome-icon icon="arrow-right-long" />
            </template>
          </MainButton>
        </div>
      </div>
    </div>
  </div>

  <ModalWindow v-model="isModalOpen" maxWidth="xl" @close="closeModal">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-white">
          Month Settings - {{ getMonthName(currentMonthNumber - 1) }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
          aria-label="Close modal"
        >
          <font-awesome-icon icon="times" class="w-5 h-5" />
        </button>
      </div>
    </template>

    <div class="p-3 overflow-y-auto max-h-[60vh] bg-gray-800/30">
      <form @submit.prevent="submitMonth" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label for="month-description" class="block text-sm font-medium text-white/70 mb-1.5">
              Month Description
            </label>
            <input
              v-model="currentMonthRecord.description"
              type="text"
              class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a short description"
            />
          </div>

          <div>
            <label for="top-day" class="block text-sm font-medium text-white/70 mb-1.5">
              Top Day
            </label>
            <input
              v-model="topDayNumber"
              type="text"
              class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter day number (1-31)"
            />
          </div>

          <div>
            <label for="month-photo" class="block text-sm font-medium text-white/70 mb-1.5">
              Background Photo
            </label>
            <input
              ref="fileInput"
              type="file"
              name="month-photo"
              accept="image/*,video/*"
              class="hidden"
              @change="handleBackgroundSelected"
            />
            <div
              @click="fileInput?.click()"
              class="w-full h-40 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/70 transition-all duration-200 group overflow-hidden"
            >
              <video
                v-if="selectedBackgroundPreviewUrl && isSelectedBackgroundPreviewVideo"
                class="w-full h-full object-cover"
                :src="selectedBackgroundPreviewUrl"
                autoplay
                muted
                loop
                playsinline
              />
              <img
                v-else-if="selectedBackgroundPreviewUrl"
                class="w-full h-full object-cover"
                :src="selectedBackgroundPreviewUrl"
                alt="preview"
              />
              <template v-else>
                <font-awesome-icon
                  icon="cloud-upload-alt"
                  class="text-gray-400 text-3xl mb-2 group-hover:text-white transition-colors"
                />
                <p class="text-gray-400 text-sm group-hover:text-white transition-colors">
                  Click to upload or drag and drop
                </p>
              </template>
              <p class="text-gray-500 text-xs mt-1">
                {{ selectedBackgroundFile ? selectedBackgroundFile.name : 'Image/Video (max. 5MB)' }}
              </p>
            </div>
          </div>

          <p v-if="errorMessage" class="text-red-400 text-sm mt-1">
            {{ errorMessage }}
          </p>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex space-x-3">
        <MainButton type="button" variant="secondary" @click="closeModal" class="px-4">
          Cancel
        </MainButton>
        <AuthButton @click="submitMonth" class="px-6 min-w-[120px]" :loading="isLoading">
          <template #default>Save Changes</template>
          <template #icon-right v-if="!isLoading">
            <font-awesome-icon icon="save" />
          </template>
        </AuthButton>
      </div>
    </template>
  </ModalWindow>
</template>
