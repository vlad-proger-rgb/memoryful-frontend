import { computed, ref } from 'vue'

import daysApi from '@/api/days'
import { DAY_MS, startOfDay } from '@/utils/dates'

/** The span of written days, as midnight timestamps in ms, for the date range to cover. */
export function useDayBounds() {
  const oldest = ref<number | null>(null)
  const newest = ref<number | null>(null)

  // A year back from today until the first day is known, so the slider is never a zero-width track.
  const min = computed(() => oldest.value ?? startOfDay(new Date()).getTime() - 365 * DAY_MS)
  const max = computed(() => newest.value ?? startOfDay(new Date()).getTime())

  const load = async () => {
    try {
      const [first, last] = await Promise.all([
        daysApi.getDays({ limit: 1, sortField: 'timestamp', sortOrder: 'asc' }),
        daysApi.getDays({ limit: 1, sortField: 'timestamp', sortOrder: 'desc' }),
      ])
      const firstDay = first.data?.[0]
      const lastDay = last.data?.[0]
      if (firstDay) oldest.value = startOfDay(new Date(firstDay.timestamp * 1000)).getTime()
      if (lastDay) newest.value = startOfDay(new Date(lastDay.timestamp * 1000)).getTime()
    } catch {
      // Without bounds the slider keeps its fallback span; the date buttons still work.
    }
  }

  return { min, max, load }
}
