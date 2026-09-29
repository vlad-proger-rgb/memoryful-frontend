import { computed, ref } from 'vue'

import daysApi from '@/api/days'
import type { DayListItem } from '@/types'
import { DAY_MS, endOfDay, startOfDay, toTimestamp } from '@/utils/dates'

/** The span of written days, as midnight timestamps in ms, for the date range to cover, and today's entry. */
export function useDayBounds() {
  const oldest = ref<number | null>(null)
  const newest = ref<number | null>(null)
  const today = ref<DayListItem | null>(null)

  // A year back from today until the first day is known, so the slider is never a zero-width track.
  const min = computed(() => oldest.value ?? startOfDay(new Date()).getTime() - 365 * DAY_MS)
  const max = computed(() => newest.value ?? startOfDay(new Date()).getTime())

  const load = async () => {
    const now = new Date()
    try {
      const { data } = await daysApi.getSummary(
        toTimestamp(startOfDay(now)),
        toTimestamp(endOfDay(now)),
      )
      if (data?.oldest != null) oldest.value = startOfDay(new Date(data.oldest * 1000)).getTime()
      if (data?.newest != null) newest.value = startOfDay(new Date(data.newest * 1000)).getTime()
      const found = data?.today
      today.value = found ? { ...found, timestamp: found.timestamp * 1000, exists: true } : null
    } catch {
      // Without bounds the slider keeps its fallback span; the date buttons still work.
    }
  }

  return { min, max, today, load }
}
