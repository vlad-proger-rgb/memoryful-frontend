import { computed, ref, watch, type Ref } from 'vue'

import daysApi from '@/api/days'
import insightsApi from '@/api/insights'
import weekDigestsApi from '@/api/week-digests'
import useUiStore from '@/stores/ui'
import type { ChatModelRef, DayListItem, InsightInDB, WeekDigestInDB } from '@/types'
import {
  endOfDay,
  formatDate,
  startOfDay,
  toIsoDate,
  toTimestamp,
  weekFromIso,
  weekOf,
} from '@/utils/dates'

export type DigestMode = 'today' | 'week'

export interface DigestPeriod {
  startIso: string
  endIso: string
  title: string
  subtitle: string
  /** How the period reads mid-sentence: "Nothing for {noun} yet". */
  noun: string
}

export interface WeekOption {
  weekStart: string
  label: string
}

export interface DigestDay {
  iso: string
  date: Date
  letter: string
  number: number
  entry: DayListItem | null
  isToday: boolean
}

// Day timestamps are midnight UTC; createdAt is whenever the AI happened to run.
const isoOf = (timestamp: number) => new Date(timestamp * 1000).toISOString().slice(0, 10)

const PAGE = 50
const WEEKS = 26

export function useDigest(mode: Ref<DigestMode>) {
  const uiStore = useUiStore()

  const today = startOfDay(new Date())
  const todayIso = toIsoDate(today)

  const currentWeek = weekOf(today)

  const digests = ref<WeekDigestInDB[]>([])
  // The running week, not a past digest nobody asked for.
  const selectedWeekStart = ref(currentWeek.startIso)

  // One composable serves both modes, so a day must not inherit the week's digest.
  const digest = computed(() =>
    mode.value === 'week'
      ? (digests.value.find((d) => d.weekStart === selectedWeekStart.value) ?? null)
      : null,
  )

  const week = computed(() => weekFromIso(selectedWeekStart.value))

  const isCurrentWeek = computed(() => selectedWeekStart.value === currentWeek.startIso)

  const weekOptions = computed<WeekOption[]>(() => [
    { weekStart: currentWeek.startIso, label: 'This week' },
    ...digests.value
      .filter((d) => d.weekStart !== currentWeek.startIso)
      .map((d) => ({ weekStart: d.weekStart, label: weekFromIso(d.weekStart).label })),
  ])

  const period = computed<DigestPeriod>(() =>
    mode.value === 'week'
      ? {
          startIso: week.value.startIso,
          endIso: week.value.endIso,
          title: week.value.label,
          subtitle: week.value.label,
          noun: 'that week',
        }
      : {
          startIso: todayIso,
          endIso: todayIso,
          title: today.toLocaleDateString('en-US', { weekday: 'long' }),
          subtitle: formatDate(today),
          noun: 'today',
        },
  )

  const items = ref<InsightInDB[]>([])
  const days = ref<DayListItem[]>([])
  const isLoading = ref(false)
  const isLoadingDays = ref(false)
  const hasLoaded = ref(false)

  const covers = (iso: string) => iso >= period.value.startIso && iso <= period.value.endIso
  const inPeriod = computed(() => items.value.filter((item) => covers(isoOf(item.timestamp))))

  const insights = computed(() => inPeriod.value.filter((i) => i.kind === 'observation'))
  const suggestions = computed(() => inPeriod.value.filter((i) => i.kind === 'suggestion'))

  // A day's items all come from one run, so the first one names the author.
  const authorModel = computed<ChatModelRef | null>(() =>
    mode.value === 'week'
      ? (digest.value?.chatModel ?? null)
      : (inPeriod.value[0]?.chatModel ?? null),
  )

  const stats = computed(() => [
    { label: 'entries', value: days.value.length.toLocaleString() },
    { label: 'starred', value: days.value.filter((day) => day.starred).length.toLocaleString() },
  ])

  const weekDays = computed<DigestDay[]>(() => {
    const written = new Map(days.value.map((day) => [toIsoDate(new Date(day.timestamp)), day]))
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(week.value.start)
      date.setDate(date.getDate() + index)
      const iso = toIsoDate(date)
      return {
        iso,
        date,
        letter: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
        number: date.getDate(),
        entry: written.get(iso) ?? null,
        isToday: iso === todayIso,
      }
    })
  })

  const loadItems = async () => {
    if (hasLoaded.value) return
    isLoading.value = true
    try {
      const response = await insightsApi.getInsights({ limit: PAGE, offset: 0 })
      items.value = response.data || []
      hasLoaded.value = true
    } catch (e: unknown) {
      uiStore.showToast((e as { msg?: string })?.msg || 'Failed to load AI content', 'error')
    } finally {
      isLoading.value = false
    }
  }

  const loadDigests = async () => {
    try {
      const response = await weekDigestsApi.getWeekDigests({ limit: WEEKS, offset: 0 })
      digests.value = response.data || []
    } catch {
      digests.value = []
    }
  }

  const loadDays = async () => {
    isLoadingDays.value = true
    try {
      const response = await daysApi.getDays({
        limit: PAGE,
        sortField: 'timestamp',
        sortOrder: 'asc',
        filters: {
          createdAfter: toTimestamp(startOfDay(week.value.start)),
          createdBefore: toTimestamp(endOfDay(week.value.end)),
        },
      })
      days.value = (response.data ?? []).map((day) => ({
        ...day,
        timestamp: day.timestamp * 1000,
        exists: true,
      }))
    } catch {
      days.value = []
    } finally {
      isLoadingDays.value = false
    }
  }

  watch(week, loadDays)

  const load = async () => {
    loadItems()
    if (mode.value !== 'week') return
    await loadDigests()
    if (!days.value.length) loadDays()
  }

  /** Waits for a queued digest of `target` to land, then selects it. */
  const refreshDigest = async (target: string, attempts = 10, delayMs = 2000) => {
    const before = digests.value.find((d) => d.weekStart === target)?.updatedAt

    for (let i = 0; i < attempts; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      try {
        const response = await weekDigestsApi.getWeekDigest(target)
        if (response.data && response.data.updatedAt !== before) {
          await loadDigests()
          selectedWeekStart.value = target
          return true
        }
      } catch {
        // 404 until the first one for this week exists; keep waiting.
      }
    }
    return false
  }

  return {
    period,
    week,
    digest,
    digests,
    weekOptions,
    isCurrentWeek,
    selectedWeekStart,
    days,
    weekDays,
    stats,
    insights,
    suggestions,
    authorModel,
    isLoading,
    isLoadingDays,
    load,
    refreshDigest,
  }
}
