<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useUserStore } from '@/stores/user'
import daysApi from '@/api/days'
import type { DayDetail, DayUpdate } from '@/types'

import { getIcon } from '@/plugins/fontawesome'

import DayLabledEntry from '@/components/day/DayLabledEntry.vue'
import ModalWindow from '@/components/ModalWindow.vue'
import MainButton from '@/components/MainButton.vue'
import AuthInput from '@/components/auth/AuthInput.vue'

const userStore = useUserStore()

const day = ref<DayDetail>({
  timestamp: 0,
  description: '',
  mainImage: '',
  city: userStore.user.city,
  tags: [],
  content: '',
  steps: 0,
  createdAt: '',
  updatedAt: '',
  images: [],
  trackableProgresses: [],
  starred: false,
})

const showModal = ref(false)
const isSaving = ref(false)

// Form state
const editForm = reactive<{
  mainImage: string
  images: string[]
  description: string
  content: string
  steps: number
  starred: boolean
}>({
  mainImage: '',
  images: [],
  description: '',
  content: '',
  steps: 0,
  starred: false,
})

// Reset form when day data changes
watch(
  () => day.value,
  (newVal) => {
    if (newVal) {
      editForm.mainImage = newVal.mainImage || ''
      editForm.images = newVal.images || []
      editForm.description = newVal.description || ''
      editForm.content = newVal.content
      editForm.steps = newVal.steps || 0
      editForm.starred = newVal.starred || false
    }
  },
  { immediate: true, deep: true },
)

const date = computed(() => {
  if (!day.value) return ''

  const newDate = new Date(day.value.timestamp * 1000)
  newDate.setDate(newDate.getDate())

  return newDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const toggleStarred = async () => {
  if (!day.value) return

  try {
    const updatedDay = { ...day.value, starred: !day.value.starred }
    await daysApi.toggleStarred(day.value.timestamp)
    day.value.starred = updatedDay.starred
  } catch (error) {
    console.error('Error toggling star:', error)
  }
}

const handleModalClose = () => {
  showModal.value = false
}

const saveDay = async () => {
  if (!day.value) return

  isSaving.value = true

  try {
    const updateData: DayUpdate = {
      mainImage: editForm.mainImage,
      images: editForm.images,
      description: editForm.description,
      content: editForm.content,
      steps: editForm.steps,
      starred: editForm.starred,
    }

    const updatedDay = await daysApi.updateDay(day.value.timestamp, updateData)

    // Update local state
    Object.assign(day.value, updatedDay)

    showModal.value = false
  } catch (error) {
    console.error('Error updating day:', error)
  } finally {
    isSaving.value = false
  }
}

const adjustTextareaHeight = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

onMounted(async () => {
  const route = useRoute()
  console.log(route.path)

  const [year_, month_, dayDate] = route.path.split('/').slice(2)
  console.log(year_, month_, dayDate)

  const timestamp = new Date(Number(year_), Number(month_) - 1, Number(dayDate) + 1).setUTCHours(
    0,
    0,
    0,
    0,
  )
  console.log(timestamp)

  const result = await daysApi.getDayDetail(timestamp / 1000)
  console.log(result)

  if (result.data) {
    day.value = result.data
  }

  if (!day.value) {
    day.value = {
      timestamp: 0,
      description: '',
      mainImage: '',
      city: userStore.user.city,
      tags: [],
      content: '',
      steps: 0,
      createdAt: '',
      updatedAt: '',
      images: [],
      trackableProgresses: [],
      starred: false,
    }
    showModal.value = true
  }
})
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden">
    <img
      src="/src/assets/img/day_bg.jpg"
      class="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
      alt="background"
    />
    <div class="relative z-10 pt-24 pb-8 px-4 max-w-2xl mx-auto w-full space-y-6">
      <!-- Header with date and star button -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-white">{{ day.timestamp ? date : 'Loading...' }}</h1>
        <button
          @click="toggleStarred"
          class="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          :class="{ 'text-yellow-400': day.starred, 'text-white/60': !day.starred }"
        >
          <font-awesome-icon icon="star" class="text-xl" />
        </button>
      </div>

      <!-- Main content -->
      <div class="space-y-6">
        <!-- Main image -->
        <div
          class="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/5 backdrop-blur-lg"
        >
          <img
            v-if="day.mainImage"
            :src="'/src/assets/img/' + day.mainImage"
            class="w-full h-full object-cover"
            :alt="day.city?.name || 'Day image'"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-white/30">
            <font-awesome-icon icon="image" class="text-4xl" />
          </div>
        </div>

        <!-- Tags -->
        <div v-if="day.tags?.length" class="flex flex-wrap justify-center gap-4">
          <span
            v-for="tag in day.tags"
            :key="tag.id"
            class="text-white backdrop-blur-lg px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
            :style="{
              // backgroundColor: `${tag.color}`,
              // opacity: '0.7',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
            }"
          >
            <font-awesome-icon v-if="tag.icon" :icon="getIcon(tag.icon)" />
            {{ tag.name }}
          </span>
        </div>

        <!-- Location -->
        <div class="grid grid-cols-2 gap-3">
          <DayLabledEntry
            label="Country"
            :text="day.city?.country?.name || 'No country'"
            :iconLeft="['fas', 'flag']"
            small
          />
          <DayLabledEntry
            label="City"
            :text="day.city?.name || 'No city'"
            :iconLeft="['fas', 'city']"
            small
          />
        </div>

        <!-- Description -->
        <DayLabledEntry label="Description" :text="day.description || 'No description'" />

        <!-- Content -->
        <DayLabledEntry label="Content" :text="day.content || 'No content'" :markdown="true" />

        <!-- Trackable Progresses -->
        <h3 class="text-white/70 text-sm font-medium mb-3">Trackable Progress</h3>
        <div class="space-y-3">
          <div
            v-for="progress in day.trackableProgresses"
            :key="progress.id"
            class="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4"
          >
            <div class="flex items-center space-x-3 mb-3">
              <font-awesome-icon v-if="progress.type.icon" :icon="getIcon(progress.type.icon)" />
              <h4 class="text-white font-medium">{{ progress.type.name }}</h4>
            </div>

            <div class="space-y-3">
              <div
                v-for="progressItem in progress.progresses"
                :key="progressItem.trackableItem.id"
                class="space-y-1"
              >
                <div class="flex justify-between text-xs text-white/70">
                  <span class="truncate max-w-[70%]">
                    {{ progressItem.trackableItem.title || 'Untitled' }}
                    <span v-if="progressItem.description" class="text-white/50">
                      • {{ progressItem.description }}
                    </span>
                  </span>
                  <span class="font-medium">
                    {{ progressItem.value }}
                    {{ progress.type.valueType }}
                  </span>
                </div>
                <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                    :style="{
                      width:
                        progress.type.valueType === 'percentage'
                          ? `${Math.min(100, progressItem.value)}%`
                          : '100%',
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-if="!progress.progresses?.length" class="text-center py-4 text-white/50 text-sm">
              No progress recorded yet
            </div>
          </div>

          <div
            v-if="!day.trackableProgresses?.length"
            class="text-center py-6 text-white/50 text-sm bg-white/5 rounded-2xl"
          >
            No trackable progress for this day
          </div>
        </div>

        <!-- Images -->
        <div
          v-if="day?.images?.length"
          class="flex items-center justify-between space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4"
        >
          <h3 class="text-white/70 text-sm font-medium">Images</h3>
          <div class="space-y-2">
            <div
              v-for="image in day.images"
              :key="image"
              class="bg-white/10 backdrop-blur-lg rounded-2xl p-4"
            >
              <img
                :src="image"
                class="w-full h-48 object-cover"
                :alt="day.city?.name || 'Day image'"
              />
            </div>
          </div>
        </div>

        <!-- Edit button to open modal window -->
        <MainButton class="ml-4 whitespace-nowrap" @click="showModal = true">Edit</MainButton>

        <!-- Modal window -->
        <ModalWindow v-model="showModal" title="Edit Day" maxWidth="2xl" @close="handleModalClose">
          <template #header>
            <h2 class="text-xl font-semibold text-white">Edit Day - {{ date }}</h2>
          </template>
          <template #default>
            <form @submit.prevent="saveDay" class="space-y-4">
              <!-- Description -->
              <AuthInput
                v-model="editForm.description"
                label="Description"
                type="text"
                placeholder="What made this day special?"
                icon="pencil"
                class="w-full"
              />

              <!-- Content -->
              <div>
                <label class="block text-sm font-medium text-white/70 mb-1">Content</label>
                <textarea
                  v-model="editForm.content"
                  class="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Write about your day..."
                  :style="{ height: 'auto', minHeight: '8em' }"
                  @input="adjustTextareaHeight"
                  rows="4"
                ></textarea>
              </div>

              <!-- Steps -->
              <AuthInput
                v-model.number="editForm.steps"
                label="Steps"
                type="number"
                min="0"
                placeholder="Enter number of steps"
                icon="footsteps"
                class="w-full"
              />

              <!-- Starred Toggle -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div class="flex items-center space-x-2">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :class="
                        editForm.starred ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'
                      "
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    ></path>
                  </svg>
                  <span class="text-white/90">Mark as important</span>
                </div>
                <button
                  type="button"
                  @click="editForm.starred = !editForm.starred"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :class="editForm.starred ? 'bg-blue-600' : 'bg-white/10'"
                  role="switch"
                  aria-checked="false"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                    :class="editForm.starred ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>
            </form>
          </template>
          <template #footer>
            <div class="flex justify-between w-full">
              <MainButton type="button" variant="secondary" @click="handleModalClose">
                Cancel
              </MainButton>
              <MainButton type="button" @click="saveDay" :loading="isSaving" class="bg-blue-600">
                Save Changes
              </MainButton>
            </div>
          </template>
        </ModalWindow>
      </div>
    </div>
  </div>
</template>
