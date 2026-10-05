import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import daysApi from '@/api/days'
import { dayTimestamp } from '@/utils/dates'
import { dayPath } from '@/utils/routes'

interface AdjacentDays {
  previous: string | null
  next: string | null
}

// BottomNav and DayView both watch the same day; they share one pair of requests.
const inflight = new Map<number, Promise<AdjacentDays>>()

const nearestPath = async (timestamp: number, direction: 'previous' | 'next') => {
  const { data } = await daysApi.getDays({
    limit: 1,
    sortField: 'timestamp',
    sortOrder: direction === 'next' ? 'asc' : 'desc',
    filters:
      direction === 'next' ? { createdAfter: timestamp + 1 } : { createdBefore: timestamp - 1 },
  })
  const found = data?.[0]
  return found ? dayPath(new Date(found.timestamp * 1000)) : null
}

const fetchAdjacent = (timestamp: number) => {
  let request = inflight.get(timestamp)
  if (!request) {
    request = Promise.all([nearestPath(timestamp, 'previous'), nearestPath(timestamp, 'next')])
      .then(([previous, next]) => ({ previous, next }))
      .finally(() => inflight.delete(timestamp))
    inflight.set(timestamp, request)
  }
  return request
}

/** The routes of the closest written days before and after the day route currently open. */
export function useAdjacentDays() {
  const route = useRoute()
  const previous = ref<string | null>(null)
  const next = ref<string | null>(null)

  const timestamp = computed(() => {
    if (route.name !== 'day') return null
    const { year, month, day } = route.params
    return dayTimestamp(Number(year), Number(month), Number(day))
  })

  watch(
    timestamp,
    async (current) => {
      previous.value = null
      next.value = null
      if (current == null) return
      try {
        const found = await fetchAdjacent(current)
        if (timestamp.value !== current) return
        previous.value = found.previous
        next.value = found.next
      } catch {
        // Both arrows stay disabled; the day itself still loads.
      }
    },
    { immediate: true },
  )

  const steps = computed(() => [
    { key: 'previous', label: 'Previous day', icon: 'arrow-left', to: previous.value },
    { key: 'next', label: 'Next day', icon: 'arrow-right', to: next.value },
  ])

  return { isDayRoute: computed(() => timestamp.value != null), steps }
}
