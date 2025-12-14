<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import daysApi from '@/api/days'
import tagsApi from '@/api/tags'
import countriesApi from '@/api/countries'
import citiesApi from '@/api/cities'
import type { DayListItem, Tag, Country, CityDetail } from '@/types'

import TagSelector from '@/components/day/TagSelector.vue'
import searchBgVideo from '@/assets/video/search_bg.mp4'
import { getIcon } from '@/plugins/fontawesome'
import useUiStore from '@/stores/ui'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import LocationFlow from '@/components/ui/LocationFlow.vue'

// Props for customizable background
withDefaults(defineProps<{
  backgroundVideoUrl?: string
}>(), {
  backgroundVideoUrl: searchBgVideo
})

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()

// Search state
const query = ref('')
const selectedTags = ref<Tag[]>([])
const availableTags = ref<Tag[]>([])

// Settings panel state
const showSettings = ref(false)
const similaritySearch = ref(false)
const starredOnly = ref(false)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const selectedCountry = ref<Country | null>(null)
const selectedCity = ref<CityDetail | null>(null)

// Results state
const days = ref<DayListItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const hasSearched = ref(false)

const selectedTagNames = computed(() => selectedTags.value.map((t) => t.name))

// Convert Date to timestamp (seconds)
const dateToTimestamp = (date: Date | null): number | undefined => {
  if (!date) return undefined
  return Math.floor(date.getTime() / 1000)
}

const searchDays = async () => {
  loading.value = true
  error.value = null

  try {
    const filters: Record<string, unknown> = {}

    if (query.value.trim()) {
      filters.description = { like: query.value.trim() }
    }

    if (startDate.value) {
      filters.createdAfter = dateToTimestamp(startDate.value)
    }

    if (endDate.value) {
      filters.createdBefore = dateToTimestamp(endDate.value)
    }

    if (selectedCity.value) {
      filters.cityId = selectedCity.value.id
    } else if (selectedCountry.value) {
      filters.countryId = selectedCountry.value.id
    }

    if (starredOnly.value) {
      filters.starred = true
    }

    const response = await daysApi.getDays({
      filters: Object.keys(filters).length ? (filters as any) : undefined,
      tagNames: selectedTagNames.value.length ? selectedTagNames.value : undefined,
      sortField: 'timestamp',
      sortOrder: 'desc',
    })

    days.value = (response.data || []).map((day) => ({
      ...day,
      timestamp: day.timestamp * 1000,
      exists: true,
    }))
    hasSearched.value = true
  } catch {
    error.value = 'Failed to load search results. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  try {
    const response = await tagsApi.getTags()
    availableTags.value = response.data || []
  } catch {
    // Ignore tag loading errors
  }
}

const handleSubmit = (event?: Event) => {
  event?.preventDefault()
  searchDays()
  updateUrlParams()
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const handleLocationCountryUpdate = (val: Country | null) => {
  selectedCountry.value = val
  selectedCity.value = null
}

const handleLocationCityUpdate = (val: CityDetail | null) => {
  selectedCity.value = val
  if (val?.country) {
    selectedCountry.value = val.country
  }
}

const clearCountry = () => {
  selectedCountry.value = null
  selectedCity.value = null
}

const clearCity = () => {
  selectedCity.value = null
}

const clearAllFilters = () => {
  query.value = ''
  similaritySearch.value = false
  starredOnly.value = false
  startDate.value = null
  endDate.value = null
  selectedCountry.value = null
  selectedCity.value = null
  selectedTags.value = []
  router.replace({ query: {} })
}

const getDayUrl = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `/calendar/${year}/${month}/${day}`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

// Build query params from current filters
const buildQueryParams = () => {
  const params: Record<string, string> = {}
  if (query.value.trim()) params.q = query.value.trim()
  if (similaritySearch.value) params.similarity = '1'
  if (starredOnly.value) params.starred = '1'
  if (startDate.value) params.startDate = startDate.value.toISOString().split('T')[0]
  if (endDate.value) params.endDate = endDate.value.toISOString().split('T')[0]
  if (selectedCountry.value) params.countryId = String(selectedCountry.value.id)
  if (selectedCity.value) params.cityId = String(selectedCity.value.id)
  if (selectedTags.value.length) params.tags = selectedTags.value.map(t => t.name).join(',')
  return params
}

// Update URL with current filters (without navigation)
const updateUrlParams = () => {
  const params = buildQueryParams()
  router.replace({ query: params })
}

// Restore filters from URL query params
const restoreFiltersFromUrl = async () => {
  const q = route.query

  if (q.q) query.value = String(q.q)
  if (q.similarity === '1') similaritySearch.value = true
  if (q.starred === '1') starredOnly.value = true
  if (q.startDate) startDate.value = new Date(String(q.startDate))
  if (q.endDate) endDate.value = new Date(String(q.endDate))

  // Restore city first (it can also set the country)
  if (q.cityId) {
    const cityId = String(q.cityId)
    try {
      const res = await citiesApi.getCityById(cityId)
      if (res.code === 200 && res.data && 'country' in res.data) {
        const cityDetail = res.data as unknown as CityDetail
        selectedCity.value = cityDetail
        selectedCountry.value = cityDetail.country
      }
    } catch {
      // Ignore errors
    }
  }

  // Restore country
  if (q.countryId && !selectedCountry.value) {
    const countryId = String(q.countryId)
    try {
      const response = await countriesApi.getCountries('')
      const list = response.data || []
      const country = list.find((c) => c.id === countryId)
      if (country) {
        selectedCountry.value = country
      }
    } catch {
      // Ignore errors
    }
  }

  // Restore tags (after tags are loaded)
  if (q.tags) {
    const tagNames = String(q.tags).split(',')
    await fetchTags()
    selectedTags.value = availableTags.value.filter(t => tagNames.includes(t.name))
  }

  // If any filters were present, show settings and trigger search
  const hasFilters = q.q || q.similarity || q.starred || q.startDate || q.endDate || q.countryId || q.cityId || q.tags
  if (hasFilters) {
    // Show settings if advanced filters are used
    if (q.similarity || q.starred || q.startDate || q.endDate || q.countryId || q.cityId || q.tags) {
      showSettings.value = true
    }
    searchDays()
  }
}

// Watch filters and update URL
watch(
  [query, similaritySearch, starredOnly, startDate, endDate, selectedCountry, selectedCity, selectedTags],
  () => {
    if (hasSearched.value) {
      updateUrlParams()
    }
  },
  { deep: true }
)

onMounted(async () => {
  uiStore.disableScroll = false
  await fetchTags()
  restoreFiltersFromUrl()
})
</script>

<template>
  <div class="search-page relative min-h-screen w-full overflow-x-hidden">
    <!-- Video Background (or fallback image) -->
    <video
      v-if="backgroundVideoUrl"
      autoplay
      loop
      muted
      playsinline
      class="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
    >
      <source :src="backgroundVideoUrl" type="video/mp4" />
    </video>
    <img
      v-else
      src="/src/assets/img/bg.jpg"
      class="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
      alt="background"
    />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center pt-28 pb-12 px-4 max-w-4xl mx-auto">
      <!-- Search Box -->
      <div class="w-full max-w-3xl mb-6">
        <div
          class="glass-pill flex items-center gap-5 px-4 py-3 cursor-text"
          @click="($refs.searchInput as HTMLInputElement)?.focus()"
        >
          <!-- Settings Gear -->
          <button
            type="button"
            class="shrink-0 text-white/80 hover:text-white transition-colors"
            @click.stop="toggleSettings"
          >
            <font-awesome-icon icon="gear" class="text-2xl" />
          </button>

          <!-- Search Input -->
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            placeholder="Quick Search with AI"
            class="flex-1 bg-transparent outline-none text-white text-xl tracking-wider placeholder-white/60"
            @keyup.enter="handleSubmit"
          />

          <!-- Search Button -->
          <button
            type="button"
            class="shrink-0 text-white/80 hover:text-white transition-colors"
            @click="handleSubmit"
          >
            <font-awesome-icon icon="magnifying-glass" class="text-2xl" />
          </button>
        </div>
      </div>

      <!-- Settings Panel (slides down) -->
      <Transition name="settings-slide">
        <div v-if="showSettings" class="w-full max-w-3xl mb-6">
          <div class="glass-pill-lg flex flex-col gap-3 p-4">
            <!-- Similarity Search Toggle -->
            <div class="flex flex-wrap items-center justify-between gap-5 p-2.5 max-md:flex-col max-md:items-stretch max-md:gap-2.5">
              <span class="text-xl max-md:text-lg text-white">Similarity Search</span>
              <button
                type="button"
                class="w-10 h-10 border-2 border-white/50 rounded-lg bg-transparent flex items-center justify-center cursor-pointer transition-all hover:border-white/80"
                :class="{ 'bg-white/20 !border-white': similaritySearch }"
                @click="similaritySearch = !similaritySearch"
              >
                <font-awesome-icon v-if="similaritySearch" icon="check" class="text-white" />
              </button>
            </div>

            <!-- Starred Filter -->
            <div class="flex flex-wrap items-center justify-between gap-5 p-2.5 max-md:flex-col max-md:items-stretch max-md:gap-2.5">
              <span class="text-xl max-md:text-lg text-white">Starred</span>
              <button
                type="button"
                class="w-10 h-10 border-2 border-white/50 rounded-lg bg-transparent flex items-center justify-center cursor-pointer transition-all hover:border-white/80"
                :class="{ 'bg-white/20 !border-white': starredOnly }"
                @click="starredOnly = !starredOnly"
              >
                <font-awesome-icon v-if="starredOnly" icon="check" class="text-white" />
              </button>
            </div>

            <!-- Start Date -->
            <div class="flex flex-wrap items-center justify-between gap-5 p-2.5 max-md:flex-col max-md:items-stretch max-md:gap-2.5">
              <span class="text-xl max-md:text-lg text-white">Start Date</span>
              <div class="date-picker-wrapper">
                <VueDatePicker
                  v-model="startDate"
                  :enable-time-picker="false"
                  :max-date="endDate || undefined"
                  placeholder="Select start date"
                  dark
                  auto-apply
                  :teleport="true"
                />
              </div>
            </div>

            <!-- End Date -->
            <div class="flex flex-wrap items-center justify-between gap-5 p-2.5 max-md:flex-col max-md:items-stretch max-md:gap-2.5">
              <span class="text-xl max-md:text-lg text-white">End Date</span>
              <div class="date-picker-wrapper">
                <VueDatePicker
                  v-model="endDate"
                  :enable-time-picker="false"
                  :min-date="startDate || undefined"
                  placeholder="Select end date"
                  dark
                  auto-apply
                  :teleport="true"
                />
              </div>
            </div>

            <!-- Location -->
            <div class="flex flex-wrap items-start justify-between gap-5 p-2.5 max-md:flex-col max-md:items-stretch max-md:gap-2.5">
              <span class="text-xl max-md:text-lg text-white">Location</span>
              <div class="w-full max-w-[520px] max-md:max-w-none">
                <LocationFlow
                  :country="selectedCountry"
                  :city="selectedCity"
                  country-input-id="search-country-input"
                  city-input-id="search-city-input"
                  @update:country="handleLocationCountryUpdate"
                  @update:city="handleLocationCityUpdate"
                />
                <div class="flex justify-end gap-2 mt-2">
                  <button
                    v-if="selectedCountry"
                    type="button"
                    class="text-white/70 hover:text-white text-sm"
                    @click="clearCountry"
                  >
                    Clear country
                  </button>
                  <button
                    v-if="selectedCity"
                    type="button"
                    class="text-white/70 hover:text-white text-sm"
                    @click="clearCity"
                  >
                    Clear city
                  </button>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="glass-inner p-3 rounded-[50px] relative z-[100]">
              <TagSelector v-model="selectedTags" :available-tags="availableTags" />
            </div>

            <!-- Clear Filters Button -->
            <div class="flex justify-center mt-2">
              <button
                type="button"
                class="bg-white/15 border border-white/30 rounded-full py-2.5 px-6 text-white cursor-pointer transition-all flex items-center hover:bg-white/25 hover:border-white/50"
                @click="clearAllFilters"
              >
                <font-awesome-icon icon="rotate-left" class="mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Results Section -->
      <div class="w-full max-w-4xl flex flex-col gap-6">
        <!-- Error -->
        <div v-if="error" class="glass-pill px-5 py-4 border border-red-400/40">
          <span class="text-white/90">{{ error }}</span>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <font-awesome-icon icon="spinner" class="text-4xl text-white/80 animate-spin" />
          <p class="mt-4 text-white/70 text-lg">Searching your memories...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="!days.length && hasSearched" class="text-center py-12 px-6 bg-black/50 rounded-xl backdrop-blur-sm">
          <font-awesome-icon icon="search" class="text-5xl text-white/40 mb-4" />
          <p class="text-white/80 text-xl mb-2">No days found</p>
          <p class="text-white/50">Try adjusting your search or filters</p>
        </div>

        <!-- Initial State -->
        <div v-else-if="!hasSearched" class="text-center py-12 px-6 bg-black/50 rounded-xl backdrop-blur-sm">
          <font-awesome-icon icon="wand-magic-sparkles" class="text-5xl text-white/40 mb-4" />
          <p class="text-white/80 text-xl mb-2">Search your memories</p>
          <p class="text-white/50">Use keywords, tags, or filters to find specific days</p>
        </div>

        <!-- Results List -->
        <div v-else class="flex flex-col gap-6">
          <RouterLink
            v-for="(day, idx) in days"
            :key="idx"
            :to="getDayUrl(day.timestamp)"
            class="result-card text-left"
          >
            <!-- Thumbnail -->
            <div class="result-thumbnail">
              <img
                v-if="day.mainImage"
                :src="'/src/assets/img/' + day.mainImage"
                alt="Day thumbnail"
                class="result-thumbnail-img"
              />
              <div v-else class="result-thumbnail-placeholder">
                <font-awesome-icon icon="image" class="text-white/40 text-2xl" />
              </div>
            </div>

            <!-- Content -->
            <div class="result-content">
              <!-- Header row: date + starred -->
              <div class="result-header">
                <p class="result-date">{{ formatDate(day.timestamp) }}</p>
                <font-awesome-icon
                  v-if="day.starred"
                  icon="star"
                  class="result-star"
                />
              </div>

              <p class="result-description">
                {{ day.description || 'No description' }}
              </p>

              <!-- Meta row: city + steps -->
              <div class="result-meta">
                <span v-if="day.city?.name" class="result-meta-item">
                  <font-awesome-icon icon="location-dot" class="result-meta-icon" />
                  {{ day.city.name }}
                </span>
                <span v-if="day.steps" class="result-meta-item">
                  <font-awesome-icon icon="shoe-prints" class="result-meta-icon" />
                  {{ day.steps.toLocaleString() }}
                </span>
              </div>

              <!-- Trackable progresses -->
              <div v-if="day.trackableProgresses?.length" class="result-trackables">
                <span
                  v-for="progress in day.trackableProgresses.slice(0, 4)"
                  :key="progress.trackableItem.id"
                  class="result-trackable-chip"
                  :title="progress.trackableItem.title + ': ' + progress.value"
                >
                  <font-awesome-icon
                    v-if="progress.trackableItem.icon"
                    :icon="getIcon(progress.trackableItem.icon)"
                    class="result-trackable-icon"
                  />
                  <span class="result-trackable-value">{{ progress.value }}</span>
                </span>
                <span
                  v-if="day.trackableProgresses.length > 4"
                  class="result-trackable-more"
                >
                  +{{ day.trackableProgresses.length - 4 }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glass morphism base styles */
.glass-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border-radius: 50px;
}

.glass-pill-lg {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border-radius: 50px;
}

.glass-inner {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Settings panel animation */
.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
}

.settings-slide-enter-from,
.settings-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.95);
  max-height: 0;
}

.settings-slide-enter-to,
.settings-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
  max-height: 800px;
}

/* Entry field (date, country, city inputs) */
.entry-field {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border-radius: 50px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 280px;
  max-width: 400px;
  flex: 1;
}

.entry-input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 1.1rem;
  flex: 1;
  min-width: 0;
}

.entry-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.entry-input::-webkit-calendar-picker-indicator {
  display: none;
}

.entry-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Date picker wrapper */
.date-picker-wrapper {
  min-width: 280px;
  max-width: 400px;
  flex: 1;
}

.date-picker-wrapper :deep(.dp__theme_dark) {
  --dp-background-color: rgba(30, 30, 50, 0.95);
  --dp-text-color: #fff;
  --dp-hover-color: rgba(255, 255, 255, 0.1);
  --dp-hover-text-color: #fff;
  --dp-hover-icon-color: #fff;
  --dp-primary-color: rgba(255, 255, 255, 0.3);
  --dp-primary-disabled-color: rgba(255, 255, 255, 0.1);
  --dp-primary-text-color: #fff;
  --dp-secondary-color: rgba(255, 255, 255, 0.5);
  --dp-border-color: rgba(255, 255, 255, 0.2);
  --dp-menu-border-color: rgba(255, 255, 255, 0.2);
  --dp-border-color-hover: rgba(255, 255, 255, 0.4);
  --dp-disabled-color: rgba(255, 255, 255, 0.1);
  --dp-scroll-bar-background: rgba(255, 255, 255, 0.1);
  --dp-scroll-bar-color: rgba(255, 255, 255, 0.3);
  --dp-success-color: rgba(255, 255, 255, 0.3);
  --dp-success-color-disabled: rgba(255, 255, 255, 0.1);
  --dp-icon-color: rgba(255, 255, 255, 0.7);
  --dp-danger-color: #ff6f6f;
  --dp-marker-color: rgba(255, 255, 255, 0.3);
  --dp-highlight-color: rgba(255, 255, 255, 0.1);
}

.date-picker-wrapper :deep(.dp__input_wrap) {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.date-picker-wrapper :deep(.dp__input) {
  background: transparent;
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 1.1rem;
  padding: 10px 16px;
  padding-left: 40px;
  box-shadow: none;
}

.date-picker-wrapper :deep(.dp__input::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}

.date-picker-wrapper :deep(.dp__input_icon) {
  color: rgba(255, 255, 255, 0.7);
  left: 12px;
}

.date-picker-wrapper :deep(.dp__clear_icon) {
  color: rgba(255, 255, 255, 0.7);
}

.date-picker-wrapper :deep(.dp__menu) {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.entry-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25rem;
  margin-left: 10px;
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgba(30, 30, 50, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  z-index: 9999;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  text-align: left;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style>
/* Teleported dropdown - needs to be unscoped */
.dropdown-menu-teleported {
  background: rgba(30, 30, 50, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  z-index: 9999;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dropdown-menu-teleported .dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  text-align: left;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-menu-teleported .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style scoped>
/* Result card */
.result-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border-radius: 50px;
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
}

.result-thumbnail {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
}

.result-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-star {
  color: #fbbf24;
  font-size: 1rem;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.result-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.result-meta-icon {
  font-size: 0.95rem;
  opacity: 0.8;
}

.result-trackables {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.result-trackable-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.result-trackable-icon {
  font-size: 0.9rem;
  opacity: 0.9;
}

.result-trackable-value {
  font-weight: 500;
}

.result-trackable-more {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  font-style: italic;
}

.result-card:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.result-date {
  color: white;
  font-size: 1.1rem;
  letter-spacing: 2px;
}

.result-description {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  letter-spacing: 1px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .entry-field {
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
