<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import DashboardRail from '@/components/dashboard/DashboardRail.vue'
import DateRangeSlider from '@/components/dashboard/DateRangeSlider.vue'
import DayFeed from '@/components/dashboard/DayFeed.vue'
import ScrollTopButton from '@/components/dashboard/ScrollTopButton.vue'
import SearchBar from '@/components/dashboard/SearchBar.vue'
import SearchFilters from '@/components/dashboard/SearchFilters.vue'
import CollapseTransition from '@/components/ui/CollapseTransition.vue'
import MediaBackground from '@/components/ui/MediaBackground.vue'
import { useDayBounds, useDayFeed, useDayFilters } from '@/composables'
import useUiStore from '@/stores/ui'
import useWorkspaceStore from '@/stores/workspace'

const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()

const background = computed(() => workspaceStore.backgrounds.dashboard)

const { days, isLoading, isLoadingMore, hasMore, errorMessage, reload, loadMore, toggleStarred } =
  useDayFeed(() => request.value)

const {
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
} = useDayFilters(reload)

const { min, max, load: loadBounds } = useDayBounds()

// The extra filters stay behind the gear; the date range is always on screen.
const showFilters = ref(false)

onMounted(async () => {
  uiStore.disableScroll = false
  showFilters.value = await restore()
  await Promise.all([reload(), loadBounds()])
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
        <DashboardRail
          class="order-2 mx-auto w-full max-w-2xl xl:sticky xl:top-[calc(var(--app-header-height)+16px)] xl:order-none xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:mx-0 xl:max-w-[19rem] xl:justify-self-end"
        />

        <div
          class="order-1 mx-auto w-full max-w-2xl xl:order-none xl:col-start-2 xl:row-start-1 xl:w-[42rem]"
        >
          <SearchBar
            v-model="query"
            v-model:filters-open="showFilters"
            :can-clear="hasFilters"
            @submit="submit"
            @clear="clear"
          />

          <CollapseTransition>
            <SearchFilters
              v-if="showFilters"
              v-model:similarity="similarity"
              v-model:starred="starred"
              v-model:tags="tags"
              v-model:country="country"
              v-model:city="city"
              :available-tags="availableTags"
            />
          </CollapseTransition>

          <DateRangeSlider
            v-model:start="start"
            v-model:end="end"
            :min="min"
            :max="max"
            class="mt-3"
          />
        </div>

        <DayFeed
          class="order-3 mx-auto mt-2 w-full max-w-2xl xl:order-none xl:col-start-2 xl:row-start-2 xl:mt-6 xl:w-[42rem]"
          :days="days"
          :is-loading="isLoading"
          :is-loading-more="isLoadingMore"
          :has-more="hasMore"
          :error-message="errorMessage"
          :is-filtered="hasFilters"
          @load-more="loadMore"
          @toggle-starred="toggleStarred"
        />
      </div>
    </div>

    <ScrollTopButton />
  </div>
</template>
