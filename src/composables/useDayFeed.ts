import { nextTick, ref, toValue, type MaybeRefOrGetter } from 'vue'

import daysApi from '@/api/days'
import type { DayQuery } from '@/composables/useDayFilters'
import useUiStore from '@/stores/ui'
import type { DayListItem } from '@/types'
import { markScrollReady } from '@/utils/scrollReady'

export const DAY_FEED_PAGE_SIZE = 5

/** The days matching `query`, newest first, a page at a time. */
export function useDayFeed(query: MaybeRefOrGetter<DayQuery>) {
  const uiStore = useUiStore()

  const days = ref<DayListItem[]>([])
  const isLoading = ref(true)
  const isLoadingMore = ref(false)
  const hasMore = ref(true)
  const errorMessage = ref('')

  const fetchPage = async (offset: number) => {
    const response = await daysApi.getDays({
      ...toValue(query),
      sortField: 'timestamp',
      sortOrder: 'desc',
      limit: DAY_FEED_PAGE_SIZE,
      offset,
    })
    return (response.data ?? []).map((day) => ({
      ...day,
      timestamp: day.timestamp * 1000,
      exists: true,
    }))
  }

  const reload = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const batch = await fetchPage(0)
      days.value = batch
      hasMore.value = batch.length === DAY_FEED_PAGE_SIZE
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
      hasMore.value = batch.length === DAY_FEED_PAGE_SIZE
    } catch (e: unknown) {
      const maybeErr = e as { msg?: string }
      uiStore.showToast(maybeErr?.msg || 'Failed to load more days', 'error')
      hasMore.value = false
    } finally {
      isLoadingMore.value = false
    }
  }

  const toggleStarred = async (day: DayListItem) => {
    day.starred = !day.starred
    try {
      await daysApi.toggleStarred(day.timestamp / 1000)
    } catch {
      day.starred = !day.starred
      uiStore.showToast('Failed to update the star', 'error')
    }
  }

  return { days, isLoading, isLoadingMore, hasMore, errorMessage, reload, loadMore, toggleStarred }
}
