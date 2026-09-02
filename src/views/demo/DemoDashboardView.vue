<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import citiesApi from '@/api/cities'
import countriesApi from '@/api/countries'
import daysApi from '@/api/days'
import insightsApi from '@/api/insights'
import suggestionsApi from '@/api/suggestions'
import tagsApi from '@/api/tags'
import fallbackAvatar from '@/assets/img/avatar-fallback.webp'
import DayCard from '@/components/day/DayCard.vue'
import DayImage from '@/components/day/DayImage.vue'
import DayInfo from '@/components/day/DayInfo.vue'
import DayStats from '@/components/day/DayStats.vue'
import DayTrackables from '@/components/day/DayTrackables.vue'
import TagSelector from '@/components/day/TagSelector.vue'
import MainButton from '@/components/MainButton.vue'
import ModalWindow from '@/components/ModalWindow.vue'
import LocationFlow from '@/components/ui/LocationFlow.vue'
import MediaBackground from '@/components/ui/MediaBackground.vue'
import { useResolvedStorageMedia } from '@/composables'
import { markScrollReady } from '@/utils/scrollReady'
import { getIcon } from '@/plugins/fontawesome'
import useAiChatStore from '@/stores/aiChat'
import useUiStore from '@/stores/ui'
import { useUserStore } from '@/stores/user'
import useWorkspaceStore from '@/stores/workspace'
import type {
  CityDetail,
  Country,
  DayFilters,
  DayListItem,
  InsightInDB,
  SuggestionInDB,
  Tag,
} from '@/types'

const route = useRoute()
const router = useRouter()
const aiChatStore = useAiChatStore()
const uiStore = useUiStore()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()

const PAGE_SIZE = 5
const DAY_MS = 24 * 60 * 60 * 1000
const DIGEST_DAYS = 7
const DIGEST_WEEKS = 8

const startOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const endOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

const parseDate = (value: unknown): Date | null => {
  if (!value) return null
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const toIsoDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000)

const formatShort = (value: number) =>
  new Date(value).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })

const formatDayLabel = (value: number) =>
  new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const query = ref(String(route.query.q ?? ''))
const appliedQuery = ref(query.value)
const similaritySearch = ref(route.query.similarity === '1')
const starredOnly = ref(route.query.starred === '1')
const startDate = ref<Date | null>(parseDate(route.query.start))
const endDate = ref<Date | null>(parseDate(route.query.end))
const selectedTags = ref<Tag[]>([])
const availableTags = ref<Tag[]>([])
const selectedCountry = ref<Country | null>(null)
const selectedCity = ref<CityDetail | null>(null)

// The extra filters stay behind the gear; the date range is always on screen.
const showFilters = ref(false)

const days = ref<DayListItem[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const errorMessage = ref('')

// Restoring the URL sets several filters in a row; without this each one would refetch.
const isRestoring = ref(true)

const hasFilters = computed(
  () =>
    !!appliedQuery.value.trim() ||
    !!startDate.value ||
    !!endDate.value ||
    !!selectedCountry.value ||
    !!selectedCity.value ||
    selectedTags.value.length > 0 ||
    starredOnly.value,
)

const background = computed(() => workspaceStore.backgrounds.dashboard)

const displayName = computed(() => userStore.user.firstName || 'User')
const { url: avatarUrl } = useResolvedStorageMedia(() => userStore.user.photo, {
  fallbackSrc: fallbackAvatar,
})

/* ---------- the date range: two fields over one two-handle slider ---------- */

const oldestDay = ref<number | null>(null)
const newestDay = ref<number | null>(null)

// A year back from today until the first day is known, so the slider is never a zero-width track.
const sliderMin = computed(() => oldestDay.value ?? startOfDay(new Date()).getTime() - 365 * DAY_MS)
const sliderMax = computed(() => newestDay.value ?? startOfDay(new Date()).getTime())

const rangeStart = ref(sliderMin.value)
const rangeEnd = ref(sliderMax.value)
const isDraggingRange = ref(false)

const syncRangeFromDates = () => {
  rangeStart.value = startDate.value ? startOfDay(startDate.value).getTime() : sliderMin.value
  rangeEnd.value = endDate.value ? startOfDay(endDate.value).getTime() : sliderMax.value
}

const percentOf = (value: number) => {
  const span = sliderMax.value - sliderMin.value
  if (span <= 0) return 0
  return Math.min(100, Math.max(0, ((value - sliderMin.value) / span) * 100))
}

const fillStyle = computed(() => ({
  left: `${percentOf(rangeStart.value)}%`,
  right: `${100 - percentOf(rangeEnd.value)}%`,
}))

const onRangeStartInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  rangeStart.value = Math.min(value, rangeEnd.value)
  isDraggingRange.value = true
}

const onRangeEndInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  rangeEnd.value = Math.max(value, rangeStart.value)
  isDraggingRange.value = true
}

// A handle parked on its end of the track means "unbounded", so dragging it back clears the filter.
const commitRange = () => {
  isDraggingRange.value = false
  startDate.value = rangeStart.value > sliderMin.value ? new Date(rangeStart.value) : null
  endDate.value = rangeEnd.value < sliderMax.value ? new Date(rangeEnd.value) : null
}

const loadDateBounds = async () => {
  try {
    const [oldest, newest] = await Promise.all([
      daysApi.getDays({ limit: 1, sortField: 'timestamp', sortOrder: 'asc' }),
      daysApi.getDays({ limit: 1, sortField: 'timestamp', sortOrder: 'desc' }),
    ])
    const first = oldest.data?.[0]
    const last = newest.data?.[0]
    if (first) oldestDay.value = startOfDay(new Date(first.timestamp * 1000)).getTime()
    if (last) newestDay.value = startOfDay(new Date(last.timestamp * 1000)).getTime()
  } catch {
    // Without bounds the slider keeps its fallback span; the date fields still work.
  }
  syncRangeFromDates()
}

/* ---------- the day list ---------- */

const syncUrl = () => {
  const params: Record<string, string> = {}
  if (appliedQuery.value.trim()) params.q = appliedQuery.value.trim()
  if (similaritySearch.value) params.similarity = '1'
  if (starredOnly.value) params.starred = '1'
  if (startDate.value) params.start = toIsoDate(startDate.value)
  if (endDate.value) params.end = toIsoDate(endDate.value)
  if (selectedCity.value) params.cityId = String(selectedCity.value.id)
  else if (selectedCountry.value) params.countryId = String(selectedCountry.value.id)
  if (selectedTags.value.length) params.tags = selectedTags.value.map((t) => t.name).join(',')
  router.replace({ query: params })
}

const buildFilters = (): DayFilters => {
  const filters: DayFilters = {}
  const text = appliedQuery.value.trim()
  if (text) filters.description = { like: text }
  if (startDate.value) filters.createdAfter = toTimestamp(startOfDay(startDate.value))
  if (endDate.value) filters.createdBefore = toTimestamp(endOfDay(endDate.value))
  if (starredOnly.value) filters.starred = true
  if (selectedCity.value) filters.cityId = selectedCity.value.id
  else if (selectedCountry.value) filters.countryId = selectedCountry.value.id
  return filters
}

const fetchPage = async (offset: number) => {
  const filters = buildFilters()
  const tagNames = selectedTags.value.map((t) => t.name)
  const response = await daysApi.getDays({
    filters: Object.keys(filters).length ? filters : undefined,
    tagNames: tagNames.length ? tagNames : undefined,
    sortField: 'timestamp',
    sortOrder: 'desc',
    limit: PAGE_SIZE,
    offset,
  })
  return (response.data ?? []).map((day) => ({
    ...day,
    timestamp: day.timestamp * 1000,
    exists: true,
  }))
}

const loadFirstPage = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const batch = await fetchPage(0)
    days.value = batch
    hasMore.value = batch.length === PAGE_SIZE
  } catch (e: unknown) {
    const maybeErr = e as { msg?: string }
    errorMessage.value = maybeErr?.msg || 'Failed to load days'
    days.value = []
    hasMore.value = false
  } finally {
    isLoading.value = false
  }

  await nextTick()
  markScrollReady()
}

const loadMore = async () => {
  if (!hasMore.value || isLoading.value || isLoadingMore.value) return

  isLoadingMore.value = true
  try {
    const batch = await fetchPage(days.value.length)
    days.value = [...days.value, ...batch]
    hasMore.value = batch.length === PAGE_SIZE
  } catch (e: unknown) {
    const maybeErr = e as { msg?: string }
    uiStore.showToast(maybeErr?.msg || 'Failed to load more days', 'error')
    hasMore.value = false
  } finally {
    isLoadingMore.value = false
  }
}

const submitSearch = async () => {
  appliedQuery.value = query.value
  await loadFirstPage()
  syncUrl()
}

const clearFilters = async () => {
  isRestoring.value = true
  query.value = ''
  appliedQuery.value = ''
  startDate.value = null
  endDate.value = null
  similaritySearch.value = false
  starredOnly.value = false
  selectedTags.value = []
  selectedCountry.value = null
  selectedCity.value = null
  syncRangeFromDates()
  await nextTick()
  isRestoring.value = false
  await loadFirstPage()
  syncUrl()
}

const dayPath = (timestamp: number) => {
  const date = new Date(timestamp)
  return `/calendar/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const toggleStarred = async (timestamp: string | number) => {
  const day = days.value.find((item) => item.timestamp === timestamp)
  if (!day) return

  day.starred = !day.starred
  try {
    await daysApi.toggleStarred(day.timestamp / 1000)
  } catch {
    day.starred = !day.starred
    uiStore.showToast('Failed to update the star', 'error')
  }
}

/* ---------- location and tag filters ---------- */

const handleCountryUpdate = (value: Country | null) => {
  selectedCountry.value = value
  selectedCity.value = null
}

const handleCityUpdate = (value: CityDetail | null) => {
  selectedCity.value = value
  if (value?.country) selectedCountry.value = value.country
}

const fetchTags = async () => {
  try {
    const response = await tagsApi.getTags()
    availableTags.value = response.data || []
  } catch {
    // A missing tag list only costs the filter its suggestions.
  }
}

const restoreFiltersFromUrl = async () => {
  const q = route.query

  if (q.cityId) {
    try {
      const res = await citiesApi.getCityById(String(q.cityId))
      if (res.code === 200 && res.data && 'country' in res.data) {
        const cityDetail = res.data as unknown as CityDetail
        selectedCity.value = cityDetail
        selectedCountry.value = cityDetail.country
      }
    } catch {
      // A stale city id in the URL just leaves the filter unset.
    }
  }

  if (q.countryId && !selectedCountry.value) {
    try {
      const response = await countriesApi.getCountries('')
      const country = (response.data || []).find((c) => c.id === String(q.countryId))
      if (country) selectedCountry.value = country
    } catch {
      // Same as above.
    }
  }

  if (q.tags) {
    const names = String(q.tags).split(',')
    selectedTags.value = availableTags.value.filter((t) => names.includes(t.name))
  }

  if (q.cityId || q.countryId || q.tags) showFilters.value = true
}

/* ---------- today, and the AI blocks behind it ---------- */

const todayTimestamp = computed(() => startOfDay(new Date()).getTime())
const todayPath = computed(() => dayPath(todayTimestamp.value))
const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
)

const todayEntry = ref<DayListItem | null>(null)
const isCheckingToday = ref(true)

const loadToday = async () => {
  isCheckingToday.value = true
  try {
    const now = new Date()
    const response = await daysApi.getDays({
      limit: 1,
      filters: {
        createdAfter: toTimestamp(startOfDay(now)),
        createdBefore: toTimestamp(endOfDay(now)),
      },
    })
    const found = response.data?.[0]
    todayEntry.value = found ? { ...found, timestamp: found.timestamp * 1000, exists: true } : null
  } catch {
    todayEntry.value = null
  } finally {
    isCheckingToday.value = false
  }
}

type AiModalMode = 'today' | 'week'

const showAiModal = ref(false)
const aiModalMode = ref<AiModalMode>('today')
const insights = ref<InsightInDB[]>([])
const suggestions = ref<SuggestionInDB[]>([])
const isLoadingAi = ref(false)
const hasLoadedAi = ref(false)
const expandedIds = ref(new Set<string>())

const digestDays = ref<DayListItem[]>([])
const isLoadingDigest = ref(false)

const onlyDate = (value: string) => value.slice(0, 10)

interface DigestWeek {
  start: Date
  end: Date
  startIso: string
  endIso: string
  label: string
}

const startOfWeek = (date: Date) => {
  const copy = startOfDay(date)
  // Monday-first, so a "week" matches how the digest is meant to be generated.
  const weekday = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - weekday)
  return copy
}

// Only weeks that have finished: the digest is written once, after the week is over.
const digestWeeks = computed<DigestWeek[]>(() => {
  const thisWeek = startOfWeek(new Date())
  return Array.from({ length: DIGEST_WEEKS }, (_, index) => {
    const start = new Date(thisWeek)
    start.setDate(start.getDate() - (index + 1) * DIGEST_DAYS)
    const end = new Date(start)
    end.setDate(end.getDate() + (DIGEST_DAYS - 1))
    return {
      start,
      end,
      startIso: toIsoDate(start),
      endIso: toIsoDate(end),
      // The month repeats only when the week straddles two of them.
      label: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(
        'en-US',
        start.getMonth() === end.getMonth()
          ? { day: 'numeric' }
          : { month: 'short', day: 'numeric' },
      )}`,
    }
  })
})

const selectedWeekIndex = ref(0)
const selectedWeek = computed(() => digestWeeks.value[selectedWeekIndex.value])

const windowStartIso = computed(() =>
  aiModalMode.value === 'today' ? toIsoDate(new Date()) : selectedWeek.value.startIso,
)

const windowEndIso = computed(() =>
  aiModalMode.value === 'today' ? toIsoDate(new Date()) : selectedWeek.value.endIso,
)

/* The unread mark. There is no digest table yet, so "have I read the newest one" lives in
   this browser; swap the two helpers for `viewed_at` once the backend writes digests. */
const DIGEST_SEEN_KEY = 'demo:digest:lastSeenWeek'

const lastSeenWeek = ref<string>('')

const readLastSeenWeek = () => {
  try {
    lastSeenWeek.value = localStorage.getItem(DIGEST_SEEN_KEY) ?? ''
  } catch {
    lastSeenWeek.value = ''
  }
}

const markDigestSeen = (weekStartIso: string) => {
  lastSeenWeek.value = weekStartIso
  try {
    localStorage.setItem(DIGEST_SEEN_KEY, weekStartIso)
  } catch {
    // A blocked storage only costs the dot its memory.
  }
}

const hasUnreadDigest = computed(() => lastSeenWeek.value !== digestWeeks.value[0]?.startIso)

const LATEST_FALLBACK = 5

const windowInsights = computed(() =>
  insights.value.filter(
    (i) =>
      onlyDate(i.dateBegin) >= windowStartIso.value && onlyDate(i.dateBegin) <= windowEndIso.value,
  ),
)

const windowSuggestions = computed(() =>
  suggestions.value.filter(
    (s) => onlyDate(s.date) >= windowStartIso.value && onlyDate(s.date) <= windowEndIso.value,
  ),
)

// Days go quiet for a while and the window comes back empty; the last few still say
// something, so show them rather than a dead end — labeled, so the dates stay honest.
const showingLatestInsights = computed(
  () => !windowInsights.value.length && insights.value.length > 0,
)
const showingLatestSuggestions = computed(
  () => !windowSuggestions.value.length && suggestions.value.length > 0,
)

const modalInsights = computed(() =>
  showingLatestInsights.value ? insights.value.slice(0, LATEST_FALLBACK) : windowInsights.value,
)

const modalSuggestions = computed(() =>
  showingLatestSuggestions.value
    ? suggestions.value.slice(0, LATEST_FALLBACK)
    : windowSuggestions.value,
)

const digestStats = computed(() => ({
  entries: digestDays.value.length,
  starred: digestDays.value.filter((d) => d.starred).length,
  steps: digestDays.value.reduce((total, d) => total + (d.steps || 0), 0),
  tracked: digestDays.value.reduce(
    (total, d) => total + (d.trackableProgresses?.reduce((sum, p) => sum + (p.value || 0), 0) ?? 0),
    0,
  ),
}))

const aiModalTitle = computed(() =>
  aiModalMode.value === 'today' ? "Today's AI summary" : 'Weekly digest',
)

const insightIcon = (item: InsightInDB): [string, string] =>
  item.icon ? (getIcon(item.icon) as [string, string]) : ['fas', 'lightbulb']

const suggestionIcon = (item: SuggestionInDB): [string, string] =>
  item.icon ? (getIcon(item.icon) as [string, string]) : ['fas', 'wand-magic-sparkles']

const isExpanded = (id: string) => expandedIds.value.has(id)

const toggleExpanded = (id: string) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

const loadAiContent = async () => {
  if (hasLoadedAi.value) return
  isLoadingAi.value = true
  try {
    const [ins, sug] = await Promise.all([
      insightsApi.getInsights({ limit: 50, offset: 0 }),
      suggestionsApi.getSuggestions({ limit: 50, offset: 0 }),
    ])
    insights.value = ins.data || []
    suggestions.value = sug.data || []
    hasLoadedAi.value = true
  } catch (e: unknown) {
    const maybeErr = e as { msg?: string }
    uiStore.showToast(maybeErr?.msg || 'Failed to load AI content', 'error')
  } finally {
    isLoadingAi.value = false
  }
}

const loadDigestDays = async () => {
  isLoadingDigest.value = true
  try {
    const week = selectedWeek.value
    const response = await daysApi.getDays({
      limit: 50,
      sortField: 'timestamp',
      sortOrder: 'desc',
      filters: {
        createdAfter: toTimestamp(startOfDay(week.start)),
        createdBefore: toTimestamp(endOfDay(week.end)),
      },
    })
    digestDays.value = (response.data ?? []).map((day) => ({
      ...day,
      timestamp: day.timestamp * 1000,
      exists: true,
    }))
  } catch {
    digestDays.value = []
  } finally {
    isLoadingDigest.value = false
  }
}

const openAiModal = (mode: AiModalMode) => {
  aiModalMode.value = mode
  expandedIds.value = new Set()
  showAiModal.value = true
  loadAiContent()
  if (mode === 'week') {
    selectedWeekIndex.value = 0
    markDigestSeen(digestWeeks.value[0].startIso)
    loadDigestDays()
  }
}

const selectDigestWeek = (index: number) => {
  if (index === selectedWeekIndex.value) return
  selectedWeekIndex.value = index
  expandedIds.value = new Set()
  loadDigestDays()
}

const discussToday = () => {
  aiChatStore.draft = `Let's talk about my day, ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })}.`
  aiChatStore.open()
}

/* ---------- profile hand-off ---------- */

// The card and the settings header both carry `view-transition-name: welcome-card`, so the
// browser tweens one into the other instead of swapping pages outright. Chrome-only today;
// everywhere else this is just a normal push.
const openProfile = async () => {
  const target = '/settings/profile'
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!document.startViewTransition || prefersReducedMotion) {
    router.push(target)
    return
  }

  document.startViewTransition(async () => {
    await router.push(target)
    await nextTick()
  })
}

/* ---------- collapsing filter panel ---------- */

const beforeCollapseEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
}

const collapseEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
}

const afterCollapseEnter = (el: Element) => {
  ;(el as HTMLElement).style.height = 'auto'
}

const beforeCollapseLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
}

const collapseLeave = (el: Element) => {
  const element = el as HTMLElement
  // Reading the height first commits the start value, or the browser folds both frames
  // into one and the panel vanishes without animating.
  void element.offsetHeight
  element.style.height = '0'
}

/* ---------- picking a day: write it, or just go there ---------- */

type DayPickerMode = 'write' | 'jump'

const showNewEntry = ref(false)
const dayPickerMode = ref<DayPickerMode>('write')
const newEntryDate = ref<Date | null>(new Date())

const openDayPicker = (mode: DayPickerMode, date?: Date) => {
  dayPickerMode.value = mode
  newEntryDate.value = date ?? new Date()
  showNewEntry.value = true
}

const dayPickerTitle = computed(() =>
  dayPickerMode.value === 'write' ? 'New entry' : 'Go to date',
)

const dayPickerPrompt = computed(() =>
  dayPickerMode.value === 'write' ? 'Which day are you writing?' : 'Which day do you want to see?',
)

const dayPickerAction = computed(() =>
  dayPickerMode.value === 'write' ? 'Write this day' : 'Open this day',
)

// DayView opens its own edit modal for a day that does not exist yet and the day itself
// when it does — which is why writing and reading are the same jump with different words.
const goToNewEntry = () => {
  if (!newEntryDate.value) return
  const target = startOfDay(newEntryDate.value).getTime()
  showNewEntry.value = false
  router.push(dayPath(target))
}

/* ---------- pointer spotlight ---------- */

// A soft highlight that trails the cursor across a button, positioned in CSS vars.
const spotlight = ref({ x: '50%', y: '50%' })

const trackSpotlight = (event: MouseEvent) => {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  spotlight.value = {
    x: `${event.clientX - box.left}px`,
    y: `${event.clientY - box.top}px`,
  }
}

/* ---------- scroll to top ---------- */

const showScrollTop = ref(false)

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 200
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ---------- wiring ---------- */

// Everything except the free-text query applies on the spot.
watch(
  [starredOnly, startDate, endDate, selectedTags, selectedCountry, selectedCity],
  async () => {
    if (isRestoring.value) return
    await loadFirstPage()
    syncUrl()
  },
  { deep: true },
)

// Keeps the handles under whatever set the range last — a date field, or the data bounds.
watch([startDate, endDate, sliderMin, sliderMax], syncRangeFromDates)

onMounted(async () => {
  uiStore.disableScroll = false
  readLastSeenWeek()

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  await fetchTags()
  await restoreFiltersFromUrl()
  isRestoring.value = false

  await Promise.all([loadFirstPage(), loadDateBounds(), loadToday()])
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="relative min-h-dvh w-full overflow-x-hidden text-white">
    <MediaBackground
      :src="background.url ?? null"
      :is-video="background.isVideo"
      :poster-url="background.posterUrl"
      :placeholder="background.placeholder"
      container-class="fixed inset-0 z-0 blur-[3px] brightness-75"
    />

    <div class="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-6 pb-20 md:px-6 md:pb-16">
      <!-- Stacked, search first, on anything narrower than xl; at xl the rail moves into the
           left column so the search stays centered over the day cards. -->
      <div
        class="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-start xl:gap-6"
      >
        <aside
          class="order-2 mx-auto flex w-full max-w-2xl flex-col gap-3 xl:order-none xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:mx-0 xl:max-w-[19rem] xl:justify-self-end xl:sticky xl:top-[calc(var(--app-header-height)+16px)]"
        >
          <!-- Only in the wide layout, where it belongs to the rail. Stacked, it repeats the
               Settings link the nav already carries and lands in an odd spot mid-column. -->
          <button type="button" class="panel welcome-card hidden xl:flex" @click="openProfile">
            <img
              :src="avatarUrl ?? fallbackAvatar"
              alt=""
              class="size-11 shrink-0 rounded-full object-cover md:size-12"
            />
            <div class="min-w-0 text-left">
              <p class="text-xs text-white/70">Welcome,</p>
              <p class="truncate text-base font-semibold md:text-lg">{{ displayName }}</p>
            </div>
            <font-awesome-icon icon="angle-right" class="ml-auto text-white/40" />
          </button>

          <!-- Two peer CTAs shout at each other on an empty day, so only one of them is
               ever the loud one: today's, until today is written. -->
          <button
            v-if="todayEntry"
            type="button"
            class="cta-primary"
            @click="openDayPicker('write')"
          >
            <font-awesome-icon icon="plus" />
            New entry
          </button>

          <div class="panel p-3">
            <div class="flex items-center justify-between">
              <p class="field-label">Today</p>
              <span class="text-[11px] text-white/50">{{ todayLabel }}</span>
            </div>

            <div v-if="isCheckingToday" class="mt-3 h-9 animate-pulse rounded-lg bg-white/10" />

            <template v-else-if="todayEntry">
              <p class="mt-2 line-clamp-2 text-sm text-white/70">
                {{ todayEntry.description || 'Written, no description yet' }}
              </p>
              <div class="mt-3 flex flex-col gap-2">
                <RouterLink :to="todayPath" class="row-button">
                  <font-awesome-icon icon="book-open" class="text-white/60" />
                  Open
                  <font-awesome-icon icon="angle-right" class="ml-auto text-white/50" />
                </RouterLink>
                <button type="button" class="row-button" @click="discussToday">
                  <font-awesome-icon icon="comments" class="text-white/60" />
                  Discuss
                  <font-awesome-icon icon="angle-right" class="ml-auto text-white/50" />
                </button>
                <button type="button" class="row-button" @click="openAiModal('today')">
                  <font-awesome-icon icon="lightbulb" class="text-white/60" />
                  AI summary
                  <font-awesome-icon icon="angle-right" class="ml-auto text-white/50" />
                </button>
              </div>
            </template>

            <template v-else>
              <p class="mt-2 text-sm text-white/60">Nothing written for today yet.</p>
              <button
                type="button"
                class="cta-create mt-3"
                :style="{ '--spot-x': spotlight.x, '--spot-y': spotlight.y }"
                @mousemove="trackSpotlight"
                @click="router.push(todayPath)"
              >
                <font-awesome-icon icon="plus" />
                Create today's entry
              </button>
              <button type="button" class="quiet-link mt-2" @click="openDayPicker('write')">
                or write another day…
              </button>
            </template>
          </div>

          <button type="button" class="cta-digest" @click="openAiModal('week')">
            <span class="flex w-full items-center gap-3">
              <span class="relative flex">
                <font-awesome-icon icon="wand-magic-sparkles" class="text-lg" />
                <span v-if="hasUnreadDigest" class="unread-dot" aria-hidden="true" />
              </span>
              <span class="flex min-w-0 flex-col items-start text-left leading-tight">
                <span class="text-sm font-semibold">
                  Weekly digest
                  <span v-if="hasUnreadDigest" class="sr-only">(unread)</span>
                </span>
                <span class="text-[11px] text-white/70">
                  {{ digestWeeks[0].label }}, summarized
                </span>
              </span>
              <font-awesome-icon icon="angle-right" class="ml-auto" />
            </span>
          </button>
        </aside>

        <div
          class="order-1 mx-auto w-full max-w-2xl xl:order-none xl:col-start-2 xl:row-start-1 xl:w-[42rem]"
        >
          <div
            class="search-bar flex cursor-text items-center gap-1 px-1.5"
            @click="($refs.searchInput as HTMLInputElement)?.focus()"
          >
            <button
              type="button"
              class="icon-button"
              aria-label="Search options"
              :aria-expanded="showFilters"
              @click.stop="showFilters = !showFilters"
            >
              <font-awesome-icon icon="gear" />
            </button>

            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Quick Search with AI"
              aria-label="Search your days"
              class="min-w-0 flex-1 bg-transparent text-base text-white placeholder-white/50 outline-none md:text-sm"
              @keyup.enter="submitSearch"
            />

            <button type="button" class="icon-button" aria-label="Search" @click="submitSearch">
              <font-awesome-icon icon="magnifying-glass" />
            </button>
          </div>

          <div v-if="hasFilters" class="mt-2 flex flex-wrap items-center gap-2 px-1">
            <span class="text-xs text-white/70">
              {{ days.length }}{{ hasMore ? '+' : '' }}
              {{ days.length === 1 && !hasMore ? 'result' : 'results' }}
            </span>
            <button type="button" class="text-button" @click="clearFilters">
              <font-awesome-icon icon="rotate-left" class="mr-1.5 text-[11px]" />
              Clear all
            </button>
          </div>

          <!-- Behind the gear. The wrapper is what collapses: animating the panel alone left
               everything below it snapping up the instant it unmounted. -->
          <Transition
            name="filters"
            @before-enter="beforeCollapseEnter"
            @enter="collapseEnter"
            @after-enter="afterCollapseEnter"
            @before-leave="beforeCollapseLeave"
            @leave="collapseLeave"
          >
            <div v-if="showFilters" class="filters-wrap">
              <div class="panel mt-3 space-y-3 p-3">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="filter-toggle"
                    :class="{ 'is-checked': similaritySearch }"
                    :aria-pressed="similaritySearch"
                    @click="similaritySearch = !similaritySearch"
                  >
                    <span class="check-box" aria-hidden="true">
                      <font-awesome-icon v-if="similaritySearch" icon="check" class="text-[10px]" />
                    </span>
                    Similarity search
                  </button>

                  <button
                    type="button"
                    class="filter-toggle"
                    :class="{ 'is-checked': starredOnly }"
                    :aria-pressed="starredOnly"
                    @click="starredOnly = !starredOnly"
                  >
                    <span class="check-box" aria-hidden="true">
                      <font-awesome-icon v-if="starredOnly" icon="check" class="text-[10px]" />
                    </span>
                    Starred
                  </button>
                </div>

                <div class="relative z-20">
                  <p class="field-label mb-1.5">Location</p>
                  <LocationFlow
                    :country="selectedCountry"
                    :city="selectedCity"
                    country-input-id="demo-country-input"
                    city-input-id="demo-city-input"
                    @update:country="handleCountryUpdate"
                    @update:city="handleCityUpdate"
                  />
                </div>

                <div class="relative z-10">
                  <p class="field-label mb-1.5">Tags</p>
                  <TagSelector v-model="selectedTags" :available-tags="availableTags" />
                </div>
              </div>
            </div>
          </Transition>

          <!-- One range: the two fields and the two handles drive the same start/end. Always
               on screen — it is the filter people actually reach for. -->
          <div class="panel mt-3 p-3">
            <div class="mb-2 flex items-center justify-between gap-3">
              <p class="field-label">Date</p>
              <button type="button" class="text-button" @click="clearFilters">
                <font-awesome-icon icon="rotate-left" class="mr-1.5 text-[11px]" />
                Clear filters
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <div class="date-field">
                <VueDatePicker
                  v-model="startDate"
                  :formats="{ input: 'M/d/yyyy' }"
                  :time-config="{ enableTimePicker: false }"
                  :max-date="endDate || undefined"
                  placeholder="Start date"
                  hide-input-icon
                  dark
                  auto-apply
                  :teleport="true"
                />
                <font-awesome-icon icon="calendar-days" class="date-field-icon" />
              </div>

              <div class="date-field">
                <VueDatePicker
                  v-model="endDate"
                  :formats="{ input: 'M/d/yyyy' }"
                  :time-config="{ enableTimePicker: false }"
                  :min-date="startDate || undefined"
                  placeholder="End date"
                  hide-input-icon
                  dark
                  auto-apply
                  :teleport="true"
                />
                <font-awesome-icon icon="calendar-days" class="date-field-icon" />
              </div>
            </div>

            <div class="range-slider" :class="{ 'is-dragging': isDraggingRange }">
              <span class="range-track" aria-hidden="true" />
              <span class="range-fill" :style="fillStyle" aria-hidden="true" />
              <input
                class="range-input"
                type="range"
                :min="sliderMin"
                :max="sliderMax"
                :step="DAY_MS"
                :value="rangeStart"
                :aria-valuetext="formatShort(rangeStart)"
                aria-label="Range start"
                @input="onRangeStartInput"
                @change="commitRange"
              />
              <input
                class="range-input"
                type="range"
                :min="sliderMin"
                :max="sliderMax"
                :step="DAY_MS"
                :value="rangeEnd"
                :aria-valuetext="formatShort(rangeEnd)"
                aria-label="Range end"
                @input="onRangeEndInput"
                @change="commitRange"
              />
            </div>

            <div class="flex justify-between text-[11px] text-white/50">
              <span>{{ formatShort(rangeStart) }}</span>
              <span>{{ formatShort(rangeEnd) }}</span>
            </div>
          </div>
        </div>

        <!-- Days, newest first, five at a time -->
        <div
          class="order-3 mx-auto w-full max-w-2xl xl:order-none xl:col-start-2 xl:row-start-2 xl:w-[42rem]"
        >
          <div class="mt-2 xl:mt-6">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h1 class="text-lg font-semibold md:text-xl">
                {{ hasFilters ? 'Search results' : 'Latest days' }}
              </h1>
              <!-- The merged view lost the calendar's "jump to a specific day"; this is it. -->
              <button type="button" class="text-button" @click="openDayPicker('jump')">
                <font-awesome-icon icon="calendar-day" class="mr-1.5 text-[11px]" />
                Go to date
              </button>
            </div>

            <div v-if="errorMessage" class="panel border border-red-400/40 px-4 py-3 text-sm">
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
                :icon="hasFilters ? 'magnifying-glass' : 'book'"
                class="mb-3 text-3xl text-white/40"
              />
              <p class="mb-1 text-base text-white/80">
                {{ hasFilters ? 'No days found' : 'Nothing written yet' }}
              </p>
              <p class="text-sm text-white/50">
                {{
                  hasFilters
                    ? 'Try another keyword, or widen the filters'
                    : 'Start with a new entry'
                }}
              </p>
            </div>

            <template v-else>
              <div v-for="day in days" :key="day.timestamp" class="day-focus">
                <DayCard>
                  <template #image>
                    <DayImage :src="day.mainImage" alt="" size="card" />
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
                    <MainButton
                      class="whitespace-nowrap"
                      @click="router.push(dayPath(day.timestamp))"
                    >
                      <template #default>Open</template>
                      <template #icon-right>
                        <font-awesome-icon icon="arrow-right-long" />
                      </template>
                    </MainButton>
                  </template>
                </DayCard>
              </div>
            </template>

            <div v-if="days.length && hasMore" class="flex justify-center py-4">
              <button type="button" class="load-more" :disabled="isLoadingMore" @click="loadMore">
                <font-awesome-icon
                  :icon="isLoadingMore ? 'spinner' : 'angle-down'"
                  :class="isLoadingMore ? 'animate-spin' : ''"
                />
                {{ isLoadingMore ? 'Loading...' : `Load ${PAGE_SIZE} more` }}
              </button>
            </div>
            <p v-else-if="days.length" class="py-6 text-center text-sm text-white/50">
              That's every day so far.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <button v-if="showScrollTop" type="button" class="scroll-top" @click="scrollToTop">
        <font-awesome-icon icon="arrow-up" class="mr-2" />
        Scroll to top
      </button>
    </Transition>

    <!-- Insights and suggestions, the two dashboard blocks folded into one window -->
    <ModalWindow v-model="showAiModal" max-width="2xl">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-white">{{ aiModalTitle }}</h2>
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:text-white"
            aria-label="Close"
            @click="showAiModal = false"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>
      </template>

      <div class="space-y-5">
        <!-- Each digest belongs to one finished week, so the older ones live right here. -->
        <div v-if="aiModalMode === 'week'" class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <button
            v-for="(week, index) in digestWeeks"
            :key="week.startIso"
            type="button"
            class="week-chip"
            :class="{ 'is-selected': index === selectedWeekIndex }"
            @click="selectDigestWeek(index)"
          >
            {{ index === 0 ? 'Last week' : week.label }}
          </button>
        </div>

        <div v-if="aiModalMode === 'week'" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div class="stat-tile">
            <span class="stat-value">{{ isLoadingDigest ? '—' : digestStats.entries }}</span>
            <span class="stat-label">entries</span>
          </div>
          <div class="stat-tile">
            <span class="stat-value">{{ isLoadingDigest ? '—' : digestStats.starred }}</span>
            <span class="stat-label">starred</span>
          </div>
          <div class="stat-tile">
            <span class="stat-value">
              {{ isLoadingDigest ? '—' : digestStats.steps.toLocaleString() }}
            </span>
            <span class="stat-label">steps</span>
          </div>
          <div class="stat-tile">
            <span class="stat-value">{{ isLoadingDigest ? '—' : digestStats.tracked }}</span>
            <span class="stat-label">tracked min</span>
          </div>
        </div>

        <div v-if="isLoadingAi" class="py-8 text-center">
          <font-awesome-icon icon="spinner" class="animate-spin text-2xl text-white/80" />
        </div>

        <template v-else>
          <section>
            <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p class="field-label">Insights</p>
              <p v-if="showingLatestInsights" class="text-[11px] text-white/45">
                nothing {{ aiModalMode === 'today' ? 'today' : 'that week' }} — showing the latest
              </p>
            </div>
            <p v-if="!modalInsights.length" class="text-sm text-white/50">
              Nothing yet — write a day and mark it complete to generate.
            </p>
            <div v-else class="flex flex-col gap-2">
              <div v-for="item in modalInsights" :key="item.id">
                <button type="button" class="ai-row" @click="toggleExpanded(item.id)">
                  <font-awesome-icon :icon="insightIcon(item)" class="text-white/70" />
                  <span class="min-w-0 flex-1 text-left text-sm">{{ item.description }}</span>
                  <span class="shrink-0 text-[11px] text-white/40">
                    {{ onlyDate(item.dateBegin) }}
                  </span>
                  <font-awesome-icon
                    icon="angle-down"
                    class="shrink-0 text-white/50 transition-transform"
                    :class="isExpanded(item.id) ? 'rotate-180' : ''"
                  />
                </button>
                <div v-if="isExpanded(item.id)" class="ai-body">{{ item.content }}</div>
              </div>
            </div>
          </section>

          <section>
            <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p class="field-label">Suggestions</p>
              <p v-if="showingLatestSuggestions" class="text-[11px] text-white/45">
                nothing {{ aiModalMode === 'today' ? 'today' : 'that week' }} — showing the latest
              </p>
            </div>
            <p v-if="!modalSuggestions.length" class="text-sm text-white/50">Nothing yet.</p>
            <div v-else class="flex flex-col gap-2">
              <div v-for="item in modalSuggestions" :key="item.id">
                <button type="button" class="ai-row" @click="toggleExpanded(item.id)">
                  <font-awesome-icon :icon="suggestionIcon(item)" class="text-white/70" />
                  <span class="min-w-0 flex-1 text-left text-sm">{{ item.description }}</span>
                  <span class="shrink-0 text-[11px] text-white/40">{{ onlyDate(item.date) }}</span>
                  <font-awesome-icon
                    icon="angle-down"
                    class="shrink-0 text-white/50 transition-transform"
                    :class="isExpanded(item.id) ? 'rotate-180' : ''"
                  />
                </button>
                <div v-if="isExpanded(item.id)" class="ai-body">{{ item.content }}</div>
              </div>
            </div>
          </section>

          <section v-if="aiModalMode === 'week'">
            <p class="field-label mb-2">Days in {{ selectedWeek.label }}</p>
            <p v-if="!digestDays.length && !isLoadingDigest" class="text-sm text-white/50">
              No entries in {{ selectedWeek.label }}.
            </p>
            <div v-else class="flex flex-col gap-1.5">
              <RouterLink
                v-for="day in digestDays"
                :key="day.timestamp"
                :to="dayPath(day.timestamp)"
                class="ai-row"
                @click="showAiModal = false"
              >
                <font-awesome-icon
                  :icon="day.starred ? 'star' : 'calendar-day'"
                  :class="day.starred ? 'text-yellow-400' : 'text-white/60'"
                />
                <span class="shrink-0 text-sm">{{ formatDayLabel(day.timestamp) }}</span>
                <span class="min-w-0 flex-1 truncate text-sm text-white/60">
                  {{ day.description || 'No description' }}
                </span>
                <font-awesome-icon icon="angle-right" class="shrink-0 text-white/40" />
              </RouterLink>
            </div>
          </section>
        </template>
      </div>
    </ModalWindow>

    <!-- Picks the date, then hands over to the day editor that already exists -->
    <ModalWindow v-model="showNewEntry" max-width="sm">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-white">{{ dayPickerTitle }}</h2>
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:text-white"
            aria-label="Close"
            @click="showNewEntry = false"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>
      </template>

      <div class="flex flex-col items-center gap-3">
        <p class="text-sm text-white/60">{{ dayPickerPrompt }}</p>
        <div class="new-entry-picker">
          <VueDatePicker
            v-model="newEntryDate"
            :time-config="{ enableTimePicker: false }"
            inline
            auto-apply
            dark
          />
        </div>
      </div>

      <template #footer>
        <div class="flex w-full items-center justify-end gap-2">
          <button type="button" class="text-button" @click="showNewEntry = false">Cancel</button>
          <button type="button" class="cta-primary !w-auto px-4" @click="goToNewEntry">
            <font-awesome-icon :icon="dayPickerMode === 'write' ? 'pen' : 'arrow-right-long'" />
            {{ dayPickerAction }}
          </button>
        </div>
      </template>
    </ModalWindow>
  </div>
</template>

<style scoped>
/* Borrowed from DayView: a block under the pointer turns less translucent, which pulls the
   eye to it. Every surface on this page opts in through .panel / .search-bar / .day-focus. */
.panel {
  background: rgba(255, 255, 255, 0.11);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.panel:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.26);
  box-shadow: 0 12px 30px -16px rgba(0, 0, 0, 0.85);
}

/* The day cards come from the shared DayCard, so the focus lands on a wrapper. */
.day-focus :deep(> div) {
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.day-focus:hover :deep(> div) {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 16px 36px -18px rgba(0, 0, 0, 0.85);
}

.welcome-card {
  /* No `display` here on purpose — the template's `hidden md:flex` decides that. */
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  text-align: left;
  color: #fff;
  cursor: pointer;
  view-transition-name: welcome-card;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.welcome-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.03);
  box-shadow: 0 14px 34px -18px rgba(0, 0, 0, 0.9);
}

.welcome-card:active {
  transform: scale(0.98);
}

.field-label {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.search-bar {
  height: 44px;
  background: rgba(255, 255, 255, 0.11);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  transition:
    background 0.25s ease,
    border-color 0.15s ease,
    box-shadow 0.25s ease;
}

.search-bar:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 30px -16px rgba(0, 0, 0, 0.85);
}

.search-bar:focus-within {
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.2);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 999px;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
}

.text-button {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.15s ease;
}

.text-button:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

/* ---------- rail actions ---------- */

.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #5b4bd6 0%, #8b5cf6 55%, #c084fc 100%);
  box-shadow: 0 8px 20px -8px rgba(139, 92, 246, 0.9);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    filter 0.15s ease;
}

.cta-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
  box-shadow: 0 12px 26px -8px rgba(139, 92, 246, 1);
}

.cta-primary:active {
  transform: translateY(0) scale(0.99);
}

.cta-create {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  transition-property: transform, background, border-color;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  border: 1px solid rgba(192, 132, 252, 0.6);
  background: linear-gradient(135deg, rgba(91, 75, 214, 0.35), rgba(192, 132, 252, 0.28));
  cursor: pointer;
  transition: all 0.15s ease;
}

.cta-create:hover {
  border-color: rgba(216, 180, 254, 0.9);
  background: linear-gradient(135deg, rgba(91, 75, 214, 0.5), rgba(192, 132, 252, 0.42));
  transform: scale(1.015);
}

.cta-create:active {
  transform: scale(0.985);
}

/* The highlight sits under the label and follows --spot-x / --spot-y, which the pointer
   handler writes on the button. Wide and faint — a warm area, not a torch. */
.cta-create::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    260px 120px at var(--spot-x, 50%) var(--spot-y, 50%),
    rgba(233, 213, 255, 0.16),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cta-create:hover::after {
  opacity: 1;
}

.cta-create > * {
  position: relative;
  z-index: 1;
}

.row-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 38px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.15s ease;
}

.row-button:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
}

/* A step above the plain rows and a step below New entry: a tint and a border, no motion. */
.cta-digest {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 52px;
  padding: 10px 14px;
  border-radius: 12px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.16), rgba(139, 92, 246, 0.14));
  cursor: pointer;
  transition: all 0.15s ease;
}

.cta-digest:hover {
  border-color: rgba(255, 255, 255, 0.35);
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.26), rgba(139, 92, 246, 0.22));
}

/* ---------- filter controls ---------- */

/* The row keeps a 36px tap target while the box itself stays a control, not a tile. */
.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-toggle:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

.filter-toggle.is-checked {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.14);
}

.check-box {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0b1120;
}

.filter-toggle.is-checked .check-box {
  background: #fff;
  border-color: #fff;
}

.filters-wrap {
  overflow: hidden;
}

.filters-enter-active,
.filters-leave-active {
  transition:
    height 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.18s ease;
}

.filters-enter-from,
.filters-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.quiet-link {
  display: block;
  width: 100%;
  padding: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: color 0.15s ease;
}

.quiet-link:hover {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

.unread-dot {
  position: absolute;
  top: -3px;
  right: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f0506e;
  box-shadow: 0 0 0 2px rgba(10, 10, 16, 0.6);
}

.week-chip {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: all 0.15s ease;
}

.week-chip:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
}

.week-chip.is-selected {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.45);
}

.load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: all 0.15s ease;
}

.load-more:hover:not(:disabled) {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.35);
}

.load-more:disabled {
  opacity: 0.7;
  cursor: default;
}

/* On a phone: bottom-right corner, out from under the bar's raised orb. */
.scroll-top {
  position: fixed;
  right: 12px;
  bottom: calc(var(--bottom-nav-total) + 1rem);
  z-index: 40;
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.8125rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transition: all 0.15s ease;
}

.scroll-top:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (min-width: 768px) {
  .scroll-top {
    right: 24px;
    bottom: 2rem;
  }
}

/* Wide enough for a gutter beside the day column: park it there, at eye level, where it is
   actually noticed. 22rem clears the 42rem column's half-width plus a margin. */
@media (min-width: 1024px) {
  .scroll-top {
    top: 50%;
    right: auto;
    bottom: auto;
    left: calc(50% + 22rem);
    transform: translateY(-50%);
  }
}

/* ---------- modal content ---------- */

.stat-tile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
}

.stat-label {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.55);
}

.ai-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ai-row:hover {
  background: rgba(255, 255, 255, 0.16);
}

.ai-body {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-line;
}

.new-entry-picker :deep(.dp__theme_dark) {
  --dp-background-color: rgba(20, 20, 36, 0.9);
  --dp-text-color: #fff;
  --dp-hover-color: rgba(255, 255, 255, 0.12);
  --dp-hover-text-color: #fff;
  --dp-primary-color: #8b5cf6;
  --dp-primary-text-color: #fff;
  --dp-border-color: rgba(255, 255, 255, 0.2);
  --dp-menu-border-color: rgba(255, 255, 255, 0.2);
  --dp-icon-color: rgba(255, 255, 255, 0.7);
}

/* ---------- date range ---------- */

/* 132px is what a full date plus its icon needs — narrow enough to keep both fields on one
   row at 375px, the way the two-field range reads on a desktop. */
.date-field {
  position: relative;
  flex: 1 1 132px;
  min-width: 132px;
}

.date-field-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

/* Taller than the thumb so the track stays draggable on a phone. */
.range-slider {
  position: relative;
  height: 36px;
  margin-top: 4px;
}

.range-track,
.range-fill {
  position: absolute;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 999px;
}

.range-track {
  left: 0;
  right: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.2));
}

/* Dark at the old end, light at the recent one, so the covered span reads as a direction. */
.range-fill {
  background: linear-gradient(90deg, rgba(112, 100, 190, 0.9) 0%, rgba(184, 205, 235, 0.9) 100%);
  transition:
    left 140ms ease,
    right 140ms ease;
}

/* Following the pointer beats easing to it while a handle is being dragged. */
.range-slider.is-dragging .range-fill {
  transition: none;
}

/* Two inputs share one track: the input itself ignores pointer events so the lower
   handle is never trapped under the upper input, and only the thumbs take them back. */
.range-input {
  position: absolute;
  left: 0;
  width: 100%;
  height: 36px;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input:focus {
  outline: none;
}

.range-input::-webkit-slider-runnable-track {
  height: 36px;
  background: transparent;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  cursor: grab;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.12);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.45),
    0 0 0 5px rgba(255, 255, 255, 0.12);
}

.range-input::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.15);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.45),
    0 0 0 6px rgba(255, 255, 255, 0.18);
}

.range-input:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.35);
}

.range-input::-moz-range-track {
  height: 36px;
  background: transparent;
}

.range-input::-moz-range-thumb {
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  cursor: grab;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.range-input::-moz-range-thumb:active {
  transform: scale(1.2);
}

.range-input:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.35);
}

@media (prefers-reduced-motion: reduce) {
  .range-fill {
    transition: none;
  }

  .welcome-card:hover {
    transform: none;
  }
}

/* The date picker is a third-party widget, so its skin has to be reached with :deep */
.date-field :deep(.dp__theme_dark) {
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
  --dp-icon-color: rgba(255, 255, 255, 0.7);
  --dp-danger-color: #ff6f6f;
  --dp-marker-color: rgba(255, 255, 255, 0.3);
  --dp-highlight-color: rgba(255, 255, 255, 0.1);
}

.date-field :deep(.dp__input_wrap) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.date-field :deep(.dp__input) {
  background: transparent;
  border: none;
  border-radius: 8px;
  color: white;
  /* 16px below md, or iOS Safari zooms the page when the field takes focus. */
  font-size: 1rem;
  padding: 7px 28px 7px 10px;
  box-shadow: none;
}

@media (min-width: 768px) {
  .date-field :deep(.dp__input) {
    font-size: 0.8125rem;
  }
}

/* The calendar glyph sits on the right here, so the widget's own leading icon goes away —
   `hide-input-icon` alone still leaves it in the layout. */
.date-field :deep(.dp__input_icon),
.date-field :deep(.dp__clear_icon) {
  display: none;
}

.date-field :deep(.dp__menu) {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
</style>
