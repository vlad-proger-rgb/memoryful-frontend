import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import citiesApi from '@/api/cities'
import countriesApi from '@/api/countries'
import tagsApi from '@/api/tags'
import type { CityDetail, Country, DayFilters, Tag } from '@/types'
import { endOfDay, startOfDay, toIsoDate, toTimestamp } from '@/utils/dates'

export interface DayQuery {
  filters?: DayFilters
  tagNames?: string[]
}

const parseDate = (value: unknown): Date | null => {
  if (!value) return null
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Every dashboard filter, mirrored into the URL so a reload or Back lands on the same results. */
export function useDayFilters(apply: () => Promise<void>) {
  const route = useRoute()
  const router = useRouter()

  const query = ref(String(route.query.q ?? ''))
  const appliedQuery = ref(query.value)
  const similarity = ref(route.query.similarity === '1')
  const starred = ref(route.query.starred === '1')
  const start = ref<Date | null>(parseDate(route.query.start))
  const end = ref<Date | null>(parseDate(route.query.end))
  const tags = ref<Tag[]>([])
  const country = ref<Country | null>(null)
  const city = ref<CityDetail | null>(null)
  const availableTags = ref<Tag[]>([])

  // Restoring or clearing sets several filters in a row; without this each one would refetch.
  let isSettling = true

  const hasFilters = computed(
    () =>
      !!appliedQuery.value.trim() ||
      !!start.value ||
      !!end.value ||
      !!country.value ||
      !!city.value ||
      tags.value.length > 0 ||
      starred.value,
  )

  const request = computed<DayQuery>(() => {
    const filters: DayFilters = {}
    const text = appliedQuery.value.trim()
    if (text) filters.description = { like: text }
    if (start.value) filters.createdAfter = toTimestamp(startOfDay(start.value))
    if (end.value) filters.createdBefore = toTimestamp(endOfDay(end.value))
    if (starred.value) filters.starred = true
    if (city.value) filters.cityId = city.value.id
    else if (country.value) filters.countryId = country.value.id

    const tagNames = tags.value.map((t) => t.name)
    return {
      filters: Object.keys(filters).length ? filters : undefined,
      tagNames: tagNames.length ? tagNames : undefined,
    }
  })

  const syncUrl = () => {
    const params: Record<string, string> = {}
    if (appliedQuery.value.trim()) params.q = appliedQuery.value.trim()
    if (similarity.value) params.similarity = '1'
    if (starred.value) params.starred = '1'
    if (start.value) params.start = toIsoDate(start.value)
    if (end.value) params.end = toIsoDate(end.value)
    if (city.value) params.cityId = String(city.value.id)
    else if (country.value) params.countryId = String(country.value.id)
    if (tags.value.length) params.tags = tags.value.map((t) => t.name).join(',')
    router.replace({ query: params })
  }

  const run = async () => {
    await apply()
    syncUrl()
  }

  const submit = () => {
    appliedQuery.value = query.value
    return run()
  }

  const clear = async () => {
    isSettling = true
    query.value = ''
    appliedQuery.value = ''
    start.value = null
    end.value = null
    similarity.value = false
    starred.value = false
    tags.value = []
    country.value = null
    city.value = null
    await nextTick()
    isSettling = false
    await run()
  }

  const fetchTags = async () => {
    try {
      const response = await tagsApi.getTags()
      availableTags.value = response.data || []
    } catch {
      // A missing tag list only costs the filter its suggestions.
    }
  }

  /** Resolves the URL's ids into filters; true when any of them sit behind the gear. */
  const restore = async () => {
    const q = route.query
    const tagsLoaded = fetchTags()

    if (q.cityId) {
      try {
        const res = await citiesApi.getCityById(String(q.cityId))
        if (res.code === 200 && res.data && 'country' in res.data) {
          const cityDetail = res.data as unknown as CityDetail
          city.value = cityDetail
          country.value = cityDetail.country
        }
      } catch {
        // A stale city id in the URL just leaves the filter unset.
      }
    }

    if (q.countryId && !country.value) {
      try {
        const response = await countriesApi.getCountryById(String(q.countryId))
        if (response.data) country.value = response.data
      } catch {
        // Same as above.
      }
    }

    if (q.tags) {
      await tagsLoaded
      const names = String(q.tags).split(',')
      tags.value = availableTags.value.filter((t) => names.includes(t.name))
    }

    await nextTick()
    isSettling = false
    return Boolean(q.cityId || q.countryId || q.tags)
  }

  // Everything except the free-text query applies on the spot.
  watch(
    [starred, start, end, tags, country, city],
    () => {
      if (!isSettling) run()
    },
    { deep: true },
  )

  return {
    query,
    similarity,
    starred,
    start,
    end,
    tags,
    country,
    city,
    availableTags,
    hasFilters,
    request,
    submit,
    clear,
    restore,
  }
}
