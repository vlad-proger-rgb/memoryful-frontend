<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { daysApi, tagsApi } from '@/api'
import trackablesApi from '@/api/trackables'
import trackableTypesApi from '@/api/trackable-types'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import useWorkspaceStore from '@/stores/workspace'
import { useStorageUpload, useShake } from '@/composables'
import type { DayDetail, DayUpdate, Tag, ApiResponse, TrackableInDB, TrackableType } from '@/types'
import type { DayTrackableProgressUpdate } from '@/types/day-trackable-progress'
import { getIcon } from '@/plugins/fontawesome'
import { useLocation } from '@/composables'

import BaseBox from '@/components/ui/BaseBox.vue'
import ImageGallery from '@/components/ui/ImageGallery.vue'
import ModalWindow from '@/components/ModalWindow.vue'
import MainButton from '@/components/MainButton.vue'
import TagSelector from '@/components/day/TagSelector.vue'
import TrackableProgress from '@/components/day/TrackableProgress.vue'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete.vue'
import DayImage from '@/components/day/DayImage.vue'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'
import MediaBackground from '@/components/ui/MediaBackground.vue'
import { useResolvedStorageMedia } from '@/composables/useResolvedStorageMedia'

const { fetchCountries, fetchCities } = useLocation()

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
})

// Tags state
const tags = ref<Tag[]>([])
const isLoadingTags = ref(false)
const tagsError = ref<string | null>(null)

// Fetch tags from API
const fetchTags = async () => {
  isLoadingTags.value = true
  tagsError.value = null
  try {
    const response = await tagsApi.getTags()
    console.log('response: ', response)
    if (response.data) {
      tags.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    tagsError.value = 'Failed to load tags. Please try again later.'
  } finally {
    isLoadingTags.value = false
  }
}

const userStore = useUserStore()
const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()
const { shakeElement } = useShake()

const { url: backgroundUrl, isVideo: isBackgroundVideo } = useResolvedStorageMedia(
  () => workspaceStore.settings.dayBackground,
)

uiStore.disableScroll = false

const day = ref<DayDetail>({
  timestamp: 0,
  description: '',
  mainImage: '',
  city: userStore.user.city || {
    id: '',
    name: '',
    country: {
      id: '',
      name: '',
      code: '',
    },
  },
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
const isCompletingDay = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const dayExists = ref(false)

// Form state
interface EditForm {
  mainImage: string
  images: string[]
  description: string
  content: string
  tags: Tag[]
  city: string
  country: string
  starred: boolean
  steps?: number
  // Store IDs for proper city search
  cityId?: string
  countryId?: string
  trackableProgresses: DayTrackableProgressUpdate[]
}

const editForm = reactive<EditForm>({
  mainImage: '',
  images: [],
  description: '',
  content: '',
  tags: [],
  city: '',
  country: '',
  starred: false,
  cityId: '',
  countryId: '',
  trackableProgresses: [],
})

const trackables = ref<TrackableInDB[]>([])
const isLoadingTrackables = ref(false)
const trackablesError = ref<string | null>(null)

const trackableTypes = ref<TrackableType[]>([])
const isLoadingTrackableTypes = ref(false)
const trackableTypesError = ref<string | null>(null)

const fetchTrackables = async () => {
  isLoadingTrackables.value = true
  trackablesError.value = null
  try {
    const response = await trackablesApi.getTrackables()
    trackables.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch trackables:', error)
    trackablesError.value = 'Failed to load trackables. Please try again later.'
  } finally {
    isLoadingTrackables.value = false
  }
}

const fetchTrackableTypes = async () => {
  isLoadingTrackableTypes.value = true
  trackableTypesError.value = null
  try {
    const response = await trackableTypesApi.getTrackableTypes()
    trackableTypes.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch trackable types:', error)
    trackableTypesError.value = 'Failed to load trackable types. Please try again later.'
  } finally {
    isLoadingTrackableTypes.value = false
  }
}

const selectedTrackableTypeId = ref('')
const newTrackableItemId = ref('')
const newTrackableValue = ref<number | null>(null)
const newTrackableDescription = ref('')
const trackableTypeSearchQuery = ref('')
const isTrackableTypeDropdownOpen = ref(false)
const trackableTypeInputRef = ref<HTMLInputElement | null>(null)

const trackableItemSearchQuery = ref('')
const isTrackableItemDropdownOpen = ref(false)
const trackableItemInputRef = ref<HTMLInputElement | null>(null)

const filteredTrackableTypes = computed(() => {
  const q = trackableTypeSearchQuery.value.trim().toLowerCase()
  if (!q) return trackableTypes.value
  return trackableTypes.value.filter((t) => (t.name || '').toLowerCase().includes(q))
})

const filteredTrackableItems = computed(() => {
  const q = trackableItemSearchQuery.value.trim().toLowerCase()
  const typeId = selectedTrackableTypeId.value
  let items = trackables.value

  if (typeId) items = items.filter((t) => t.typeId === typeId)
  if (!q) return items
  return items.filter((t) => (t.title || '').toLowerCase().includes(q))
})

const selectTrackableType = (t: TrackableType) => {
  selectedTrackableTypeId.value = t.id
  trackableTypeSearchQuery.value = t.name || ''
  isTrackableTypeDropdownOpen.value = false

  newTrackableItemId.value = ''
  trackableItemSearchQuery.value = ''
  isTrackableItemDropdownOpen.value = false
}

const selectTrackableItem = (t: TrackableInDB) => {
  newTrackableItemId.value = t.id
  trackableItemSearchQuery.value = t.title || ''
  isTrackableItemDropdownOpen.value = false
}

const onTrackableTypeDropdownShowUpdate = (v: boolean) => {
  isTrackableTypeDropdownOpen.value = v
}

const onTrackableItemDropdownShowUpdate = (v: boolean) => {
  isTrackableItemDropdownOpen.value = v
}

const addTrackableProgress = () => {
  if (!selectedTrackableTypeId.value) {
    shakeElement('trackable-type-select-container')
    return
  }

  if (trackableTypeSearchQuery.value.trim() && !filteredTrackableTypes.value.length) {
    shakeElement('trackable-type-select-container')
    return
  }

  const trackableItemId = newTrackableItemId.value
  if (!trackableItemId) {
    shakeElement('trackable-item-select-container')
    return
  }

  if (trackableItemSearchQuery.value.trim() && !filteredTrackableItems.value.length) {
    shakeElement('trackable-item-select-container')
    return
  }

  const value = Number(newTrackableValue.value)
  if (!Number.isFinite(value)) {
    shakeElement('trackable-value-container')
    return
  }

  editForm.trackableProgresses = editForm.trackableProgresses.filter(
    (p) => p.trackableItemId !== trackableItemId,
  )
  editForm.trackableProgresses.push({
    trackableItemId,
    value,
    description: newTrackableDescription.value || '',
  })

  newTrackableItemId.value = ''
  newTrackableValue.value = null
  newTrackableDescription.value = ''
  trackableItemSearchQuery.value = ''
  isTrackableItemDropdownOpen.value = false
}

const removeTrackableProgress = (trackableItemId: string) => {
  editForm.trackableProgresses = editForm.trackableProgresses.filter(
    (p) => p.trackableItemId !== trackableItemId,
  )
}

// Reset form when day data changes
watch(
  () => day.value,
  (newVal: DayDetail | null) => {
    if (newVal) {
      editForm.mainImage = newVal.mainImage || ''
      editForm.images = newVal.images || []
      editForm.description = newVal.description || ''
      editForm.content = newVal.content
      editForm.tags = newVal.tags || []
      editForm.city = newVal.city?.name || ''
      editForm.country = newVal.city?.country?.name || ''
      editForm.cityId = newVal.city?.id || ''
      editForm.countryId = newVal.city?.country?.id || ''
      editForm.starred = newVal.starred || false

      editForm.trackableProgresses = (newVal.trackableProgresses || []).flatMap((byType) =>
        (byType.progresses || []).map((p) => ({
          trackableItemId: p.trackableItem.id,
          value: p.value,
          description: p.description || '',
        })),
      )
    }
  },
  { immediate: true, deep: true },
)

const date = computed(() => {
  if (!day.value?.timestamp) return ''

  const newDate = new Date(day.value.timestamp * 1000)
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
    uiStore.showToast(updatedDay.starred ? 'Starred' : 'Unstarred', 'success')
  } catch (error) {
    console.error('Error toggling star:', error)
  }
}

const completeDay = async () => {
  if (!day.value?.timestamp) return

  if (!dayExists.value) {
    uiStore.showToast('Save the day first, then mark it as complete', 'error')
    return
  }

  isCompletingDay.value = true
  try {
    await daysApi.completeDay(day.value.timestamp)
    uiStore.showToast('Day marked as complete. Generating insights...', 'success')
  } catch (error) {
    console.error('Error completing day:', error)
    uiStore.showToast('Failed to mark day as complete', 'error')
  } finally {
    isCompletingDay.value = false
  }
}

const handleModalClose = () => {
  showModal.value = false
}

const handleModalOpen = () => {
  showModal.value = true
  onModalOpen()
}

const saveDay = async () => {
  if (!day.value) return

  if (!editForm.countryId) {
    shakeElement('country-input-container')
    return
  }

  if (!editForm.cityId) {
    shakeElement('city-input-container')
    return
  }

  isSaving.value = true

  try {
    const dayPayload = {
      mainImage: editForm.mainImage,
      images: editForm.images,
      description: editForm.description || undefined,
      content: editForm.content,
      tags: editForm.tags.map((tag) => tag.id),
      cityId: editForm.cityId,
      starred: editForm.starred,
      trackableProgresses: editForm.trackableProgresses.map((p) => ({
        trackableItemId: p.trackableItemId,
        value: p.value,
        description: p.description || '',
      })),
    }

    try {
      if (dayExists.value) {
        const updateData: DayUpdate = dayPayload
        await daysApi.updateDay(day.value.timestamp, updateData)
      } else {
        await daysApi.createDay(day.value.timestamp, {
          cityId: dayPayload.cityId || '',
          description: dayPayload.description,
          content: dayPayload.content,
          steps: editForm.steps || 0,
          mainImage: dayPayload.mainImage,
          images: dayPayload.images,
          tags: dayPayload.tags,
          trackableProgresses: dayPayload.trackableProgresses,
        })
        dayExists.value = true
      }

      const response = await daysApi.getDayDetail(day.value.timestamp)
      const dayData = (response as unknown as ApiResponse<DayDetail>).data
      if (dayData) {
        Object.assign(day.value, dayData)
      }

      await fetchTags()

      uiStore.showToast('Day saved', 'success')
      showModal.value = false
    } catch (error) {
      console.error('Error saving day:', error)
    }
  } finally {
    isSaving.value = false
  }
}

const adjustTextareaHeight = (eventOrElement: Event | HTMLTextAreaElement) => {
  const textarea =
    eventOrElement instanceof Event
      ? (eventOrElement.target as HTMLTextAreaElement)
      : eventOrElement
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
}

// Initialize textarea height when modal opens
const onModalOpen = () => {
  nextTick(() => {
    const textarea = document.querySelector('.content-textarea') as HTMLTextAreaElement
    if (textarea) {
      adjustTextareaHeight(textarea)
    }
  })
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const { uploadToStorage } = useStorageUpload()

const handleMainImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  uploadToStorage({ file, intent: 'day_main', dayTimestamp: day.value.timestamp })
    .then((objectKey) => {
      editForm.mainImage = objectKey
    })
    .catch((e) => {
      console.error('Failed to upload main image:', e)
      uiStore.showToast(`Failed to upload main image: ${e?.message || e}`, 'error')
    })
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    files.forEach((file) => {
      uploadToStorage({ file, intent: 'day_image', dayTimestamp: day.value.timestamp })
        .then((objectKey) => {
          editForm.images = [...editForm.images, objectKey]
        })
        .catch((e) => {
          console.error('Failed to upload image:', e)
          uiStore.showToast(`Failed to upload image: ${e?.message || e}`, 'error')
        })
    })
  }
}

const removeImage = (index: number) => {
  editForm.images.splice(index, 1)
}

// Load day data
const loadDay = async () => {
  const route = useRoute()
  const [year_, month_, dayDate] = route.path.split('/').slice(2)

  const timestamp = new Date(Number(year_), Number(month_) - 1, Number(dayDate) + 1).setUTCHours(
    0,
    0,
    0,
    0,
  )

  try {
    const result = await daysApi.getDayDetail(timestamp / 1000)

    if (result.data) {
      day.value = result.data
      dayExists.value = true

      // Update form with day data
      editForm.mainImage = day.value.mainImage || ''
      editForm.images = [...(day.value.images || [])]
      editForm.description = day.value.description || ''
      editForm.content = day.value.content || ''
      editForm.tags = [...(day.value.tags || [])]

      // Set city and country data
      if (day.value.city) {
        editForm.city = day.value.city.name
        editForm.cityId = day.value.city.id

        if (day.value.city.country) {
          editForm.country = day.value.city.country.name
          editForm.countryId = day.value.city.country.id
        } else {
          editForm.country = ''
          editForm.countryId = ''
        }
      } else {
        editForm.city = ''
        editForm.cityId = ''
        editForm.country = ''
        editForm.countryId = ''
      }

      editForm.starred = day.value.starred || false
      editForm.steps = day.value.steps || 0
      return
    }
  } catch {
    const defaultCity = userStore.user.city || {
      id: '',
      name: '',
      country: {
        id: '',
        name: '',
        code: '',
      },
    }

    day.value = {
      timestamp: timestamp / 1000,
      description: '',
      mainImage: '',
      city: defaultCity,
      tags: [],
      content: '',
      steps: 0,
      createdAt: '',
      updatedAt: '',
      images: [],
      trackableProgresses: [],
      starred: false,
    }
    dayExists.value = false

    // Initialize form with default values
    editForm.city = defaultCity.name
    editForm.cityId = defaultCity.id
    editForm.country = defaultCity.country?.name || ''
    editForm.countryId = defaultCity.country?.id || ''

    showModal.value = true
  }
}

onMounted(async () => {
  await Promise.all([fetchTags(), fetchTrackableTypes(), fetchTrackables(), loadDay()])
})
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden">
    <!-- Background image -->
    <MediaBackground
      :src="backgroundUrl"
      :is-video="isBackgroundVideo"
      class-name="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
      fallback-class-name="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
    />

    <!-- Main content -->
    <div class="relative z-10 pt-24 pb-8 px-4 max-w-2xl mx-auto w-full space-y-6">
      <!-- Header with date and actions -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-white">{{ day.timestamp ? date : 'Loading...' }}</h1>
        <div class="flex items-center space-x-3">
          <button
            @click="toggleStarred"
            class="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            :class="{ 'text-yellow-400': day.starred, 'text-white/60': !day.starred }"
            :title="day.starred ? 'Remove from favorites' : 'Add to favorites'"
          >
            <font-awesome-icon :icon="day.starred ? 'star' : ['far', 'star']" class="text-xl" />
          </button>

          <button
            type="button"
            class="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80"
            :class="{ 'opacity-50 cursor-not-allowed': isCompletingDay || !dayExists }"
            :disabled="isCompletingDay || !dayExists"
            :title="dayExists ? 'Mark day as complete (generate insights)' : 'Save the day first'"
            @click="completeDay"
          >
            <font-awesome-icon v-if="isCompletingDay" icon="spinner" spin class="text-xl" />
            <font-awesome-icon v-else icon="check" class="text-xl" />
          </button>

          <MainButton
            type="button"
            variant="primary"
            size="sm"
            @click="handleModalOpen"
            class="!px-4 !py-2.5 bg-blue-600"
          >
            <font-awesome-icon icon="pen" class="mr-2" />
            Edit Day
          </MainButton>

          <!-- <MainButton
            type="button"
            variant="secondary"
            size="sm"
            :loading="isCompletingDay"
            @click="completeDay"
          >
            <font-awesome-icon icon="check" class="mr-2" />
            Day Completed
          </MainButton> -->
        </div>
      </div>

      <div class="space-y-6">
        <!-- Main image -->
        <BaseBox class="p-0 overflow-hidden">
          <div class="relative w-full aspect-video">
            <DayImage
              v-if="day.mainImage"
              :src="day.mainImage"
              class="w-full h-full object-cover"
              :alt="day.city?.name || 'Day image'"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-white/30">
              <font-awesome-icon icon="image" class="text-4xl" />
            </div>
          </div>
        </BaseBox>

        <!-- Tags -->
        <div v-if="day.tags?.length" class="flex flex-wrap justify-center gap-4">
          <span
            v-for="tag in day.tags"
            :key="tag.id"
            class="text-white backdrop-blur-lg px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
            :style="{
              // backgroundColor: tag.color ? `${tag.color}33` : undefined,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
            }"
          >
            <font-awesome-icon
              v-if="tag.icon"
              :icon="getIcon(tag.icon)"
              :style="{ color: tag.color || undefined }"
            />
            {{ tag.name }}
          </span>
        </div>

        <!-- Location -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            class="backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/10 rounded-lg">
                <font-awesome-icon icon="flag" class="text-white/80 text-lg" />
              </div>
              <div>
                <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
                  Country
                </h3>
                <p class="text-white/90 font-medium text-lg">
                  {{ day.city?.country?.name || 'Not specified' }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/10 rounded-lg">
                <font-awesome-icon icon="city" class="text-white/80 text-lg" />
              </div>
              <div>
                <h3 class="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
                  City
                </h3>
                <p class="text-white/90 font-medium text-lg">
                  {{ day.city?.name || 'Not specified' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <BaseBox>
          <h3 class="text-white/70 text-sm font-medium mb-3">Description</h3>
          <p class="text-white">{{ day.description || 'No description' }}</p>
        </BaseBox>

        <!-- Content -->
        <BaseBox>
          <h3 class="text-white/70 text-sm font-medium mb-3">Content</h3>
          <div class="prose prose-invert max-w-none">
            <div v-if="day.content" v-html="marked(day.content)"></div>
            <p v-else class="text-white/50">No content</p>
          </div>
        </BaseBox>

        <!-- Trackable Progress -->
        <div class="mt-8 mb-8 space-y-4">
          <div v-for="progress in day.trackableProgresses" :key="progress.type.id">
            <TrackableProgress :progress="progress" />
          </div>
          <BaseBox v-if="!day.trackableProgresses?.length" class="text-white/50">
            No trackable progress for this day
          </BaseBox>
        </div>

        <!-- Images -->
        <h3 class="text-white/70 text-sm font-medium">Images</h3>
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
          <ImageGallery
            :images="day?.images || []"
            :alt="day.city?.name || 'Day image'"
            basePath=""
          />
        </div>

        <!-- Modal window -->
        <ModalWindow
          v-model="showModal"
          maxWidth="2xl"
          @close="handleModalClose"
          class="max-h-[90vh] overflow-y-auto overflow-x-hidden"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-white">Edit Day - {{ date }}</h2>
              <button
                @click="showModal = false"
                class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
                aria-label="Close modal"
              >
                <font-awesome-icon icon="times" class="w-5 h-5" />
              </button>
            </div>
          </template>

          <template #default>
            <form @submit.prevent="saveDay" class="space-y-4">
              <!-- Starred Toggle -->
              <div
                class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div class="flex items-center space-x-2">
                  <font-awesome-icon
                    :icon="editForm.starred ? ['fas', 'star'] : ['far', 'star']"
                    :class="editForm.starred ? 'text-yellow-400' : 'text-white/40'"
                    class="w-5 h-5"
                  />
                  <span class="text-white/90">Mark as important</span>
                </div>
                <button
                  type="button"
                  @click="editForm.starred = !editForm.starred"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :class="editForm.starred ? 'bg-blue-600' : 'bg-white/10'"
                  role="switch"
                  :aria-checked="editForm.starred"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                    :class="editForm.starred ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>

              <!-- Description -->
              <div>
                <label for="description-input" class="block text-sm font-medium text-white/70 mb-1"
                  >Description</label
                >
                <input
                  v-model="editForm.description"
                  type="text"
                  class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a short description"
                />
              </div>

              <!-- City and Country -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="country-input-container">
                  <label for="country-input" class="block text-sm font-medium text-white/70 mb-1"
                    >Country</label
                  >
                  <LocationAutocomplete
                    v-model="editForm.country"
                    input-id="country-input"
                    placeholder="Search country..."
                    :icon="'globe'"
                    :show-country-code="true"
                    :full-width="true"
                    :fetch-items="fetchCountries"
                    @select="
                      (item) => {
                        editForm.country = item.name
                        editForm.countryId = item.id
                        // Clear city when country changes
                        editForm.city = ''
                        editForm.cityId = ''
                      }
                    "
                  />
                </div>
                <div id="city-input-container">
                  <label for="city-input" class="block text-sm font-medium text-white/70 mb-1"
                    >City</label
                  >
                  <LocationAutocomplete
                    v-model="editForm.city"
                    input-id="city-input"
                    :placeholder="editForm.country ? 'Search city...' : 'Select country first'"
                    :icon="'map-marker-alt'"
                    :country-id="editForm.countryId || ''"
                    :disabled="!editForm.country"
                    :full-width="true"
                    :fetch-items="
                      (query: string, countryId?: string) => fetchCities(query, countryId || '')
                    "
                    @select="
                      (item) => {
                        editForm.city = item.name
                        editForm.cityId = item.id
                      }
                    "
                  />
                </div>
              </div>

              <!-- Content -->
              <div>
                <label for="content-input" class="block text-sm font-medium text-white/70 mb-1"
                  >Content</label
                >
                <div class="quill-container">
                  <QuillEditor
                    id="content"
                    v-model:content="editForm.content"
                    contentType="html"
                    theme="snow"
                    :toolbar="[
                      ['bold', 'italic', 'underline', 'strike'],
                      ['blockquote', 'code'],
                      [{ header: [2, 3, false] }],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link'],
                    ]"
                    :options="{
                      placeholder: 'Write your day\'s story here...',
                      theme: 'snow',
                      modules: {
                        toolbar: {
                          container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code'],
                            [{ header: [2, 3, false] }],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['link'],
                          ],
                        },
                      },
                    }"
                    class="bg-white/10 text-white text-md min-h-[200px]"
                  />
                </div>
              </div>

              <!-- Tags -->
              <div>
                <label for="tags-input" class="block text-sm font-medium text-white/70 mb-1"
                  >Tags</label
                >
                <TagSelector
                  v-model="editForm.tags"
                  :available-tags="tags"
                  :loading="isLoadingTags"
                  :error="tagsError"
                  placeholder="Add tags..."
                />
              </div>

              <!-- Trackables -->
              <div>
                <label class="block text-sm font-medium text-white/70 mb-1">Trackables</label>

                <div
                  v-if="trackableTypesError"
                  class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm"
                >
                  {{ trackableTypesError }}
                </div>

                <div
                  v-if="trackablesError"
                  class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm"
                >
                  {{ trackablesError }}
                </div>

                <div class="space-y-3">
                  <div id="trackable-type-select-container" class="min-w-0">
                    <label class="block text-xs font-medium text-white/60 mb-1">Type</label>
                    <div class="relative min-w-0">
                      <input
                        ref="trackableTypeInputRef"
                        v-model="trackableTypeSearchQuery"
                        type="text"
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="isLoadingTrackableTypes ? 'Loading types...' : 'Search type...'"
                        :disabled="isLoadingTrackableTypes || !trackableTypes.length"
                        @focus="isTrackableTypeDropdownOpen = true"
                        @input="isTrackableTypeDropdownOpen = true"
                      />

                      <BaseAutocomplete
                        :show="isTrackableTypeDropdownOpen"
                        @update:show="onTrackableTypeDropdownShowUpdate"
                        :items="filteredTrackableTypes"
                        :loading="isLoadingTrackableTypes"
                        :attach-to="trackableTypeInputRef"
                        item-key="id"
                        item-label="name"
                        class="z-50"
                        @select="selectTrackableType"
                      />
                    </div>
                  </div>

                  <div id="trackable-item-select-container" class="min-w-0">
                    <label class="block text-xs font-medium text-white/60 mb-1">Item</label>
                    <div class="relative min-w-0">
                      <input
                        ref="trackableItemInputRef"
                        v-model="trackableItemSearchQuery"
                        type="text"
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        :placeholder="
                          !selectedTrackableTypeId
                            ? 'Select type first'
                            : isLoadingTrackables
                              ? 'Loading items...'
                              : 'Search item...'
                        "
                        :disabled="!selectedTrackableTypeId || isLoadingTrackables"
                        @focus="isTrackableItemDropdownOpen = true"
                        @input="isTrackableItemDropdownOpen = true"
                      />

                      <BaseAutocomplete
                        :show="isTrackableItemDropdownOpen"
                        @update:show="onTrackableItemDropdownShowUpdate"
                        :items="filteredTrackableItems"
                        :loading="isLoadingTrackables"
                        :attach-to="trackableItemInputRef"
                        item-key="id"
                        item-label="title"
                        class="z-50"
                        @select="selectTrackableItem"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div id="trackable-value-container" class="min-w-0">
                      <label class="block text-xs font-medium text-white/60 mb-1">Value</label>
                      <input
                        v-model.number="newTrackableValue"
                        type="number"
                        step="any"
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter value"
                      />
                    </div>

                    <div class="md:col-span-2 min-w-0">
                      <label class="block text-xs font-medium text-white/60 mb-1">Description</label>
                      <input
                        v-model="newTrackableDescription"
                        type="text"
                        class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div class="flex justify-end">
                    <MainButton type="button" class="bg-blue-600" @click="addTrackableProgress">
                      Add Trackable
                    </MainButton>
                  </div>
                </div>

                <div v-if="editForm.trackableProgresses.length" class="mt-3 space-y-2">
                  <div
                    v-for="p in editForm.trackableProgresses"
                    :key="p.trackableItemId"
                    class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div class="min-w-0">
                      <div class="text-white/90 font-medium truncate">
                        {{ trackables.find((t) => t.id === p.trackableItemId)?.title || 'Unknown trackable' }}
                      </div>
                      <div class="text-white/60 text-sm">
                        {{ p.value }}
                        <span v-if="p.description">- {{ p.description }}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="ml-3 text-red-200/80 hover:text-red-200 transition-colors"
                      @click="removeTrackableProgress(p.trackableItemId)"
                      title="Remove"
                    >
                      <font-awesome-icon icon="times" />
                    </button>
                  </div>
                </div>

                <BaseBox v-else class="mt-3 text-white/50">No trackables added</BaseBox>
              </div>

              <!-- Main Image -->
              <div>
                <label for="main-image-input" class="block text-sm font-medium text-white/70 mb-1"
                  >Main Image</label
                >
                <div class="flex items-center space-x-4">
                  <div
                    class="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-dashed border-white/20 flex items-center justify-center"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      @change="handleMainImageUpload"
                    />
                    <template v-if="editForm.mainImage">
                      <DayImage :src="editForm.mainImage" alt="Main" size="small" />
                    </template>
                    <template v-else>
                      <span class="text-white/40 text-sm">Upload</span>
                    </template>
                  </div>
                  <div class="text-sm text-white/60">
                    <p>Upload a main image for this day</p>
                  </div>
                </div>
              </div>

              <!-- Additional Images -->
              <div>
                <label
                  for="additional-images-input"
                  class="block text-sm font-medium text-white/70 mb-1"
                  >Additional Images</label
                >
                <div class="grid grid-cols-4 gap-3">
                  <div
                    v-for="(image, index) in editForm.images"
                    :key="index"
                    class="relative group aspect-square rounded-lg overflow-hidden bg-white/5"
                  >
                    <DayImage :src="image" :alt="`Image ${index + 1}`" size="small" />
                    <button
                      type="button"
                      @click="removeImage(index)"
                      class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <font-awesome-icon icon="times" class="text-white" />
                    </button>
                  </div>
                  <div
                    class="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                    @click="triggerImageUpload"
                  >
                    <span class="text-white/40">+ Add Image</span>
                    <input
                      type="file"
                      ref="imageInput"
                      multiple
                      accept="image/*"
                      class="hidden"
                      @change="handleImageUpload"
                    />
                  </div>
                </div>
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

<style>
.quill-container {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.ql-toolbar {
  border: none !important;
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.ql-container {
  border: none !important;
  background-color: transparent !important;
  font-family: inherit !important;
}

.ql-snow {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  background-color: transparent !important;
}

.ql-editor {
  min-height: 200px !important;
  font-size: 1rem !important;
  line-height: 1.6 !important;
  color: #e5e7eb !important;
}

/* Code block styling */
.ql-snow .ql-editor pre.ql-syntax {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  border-radius: 0.375rem !important;
  padding: 1rem !important;
  border-left: 4px solid #3b82f6 !important;
  margin: 0.5rem 0 !important;
  font-family: 'Fira Code', 'Courier New', monospace !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  overflow-x: auto !important;
}

.ql-snow .ql-editor code {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
  padding: 0.2em 0.4em !important;
  border-radius: 0.25rem !important;
  font-family: 'Fira Code', 'Courier New', monospace !important;
  font-size: 0.9em !important;
}

.ql-snow .ql-editor pre {
  margin: 0.5rem 0 !important;
  padding: 0 !important;
  background-color: transparent !important;
}

/* Syntax highlighting for code blocks */
.ql-snow .ql-editor pre.ql-syntax .token.comment,
.ql-snow .ql-editor pre.ql-syntax .token.prolog,
.ql-snow .ql-editor pre.ql-syntax .token.doctype,
.ql-snow .ql-editor pre.ql-syntax .token.cdata {
  color: #94a3b8 !important; /* Slate-400 */
  font-style: italic !important;
}

.ql-snow .ql-picker {
  color: white !important;
}

.ql-snow .ql-stroke {
  stroke: white !important;
}

.ql-snow .ql-fill {
  fill: white !important;
}

.ql-snow .ql-picker-options {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
  border-radius: 0.375rem !important;
}

.ql-snow .ql-picker-item {
  color: #e5e7eb !important;
}

.ql-snow .ql-picker-item.ql-selected,
.ql-snow .ql-picker-item:hover {
  color: #3b82f6 !important;
}

.ql-snow .ql-tooltip {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
  border-radius: 0.375rem !important;
  color: #e5e7eb !important;
}

.ql-snow .ql-tooltip input[type='text'] {
  background-color: #111827 !important;
  border: 1px solid #374151 !important;
  color: #e5e7eb !important;
  border-radius: 0.25rem !important;
}

.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  color: #3b82f6 !important;
}
</style>
