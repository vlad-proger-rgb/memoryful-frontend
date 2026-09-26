<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import daysApi from '@/api/days'
import DayPickerDropdown from '@/components/dashboard/DayPickerDropdown.vue'
import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import TodayCard from '@/components/dashboard/TodayCard.vue'
import DigestSheet from '@/components/digest/DigestSheet.vue'
import GlintButton from '@/components/ui/GlintButton.vue'
import { useDigestUnread, type DigestMode } from '@/composables'
import type { DayListItem } from '@/types'
import { endOfDay, startOfDay, toTimestamp } from '@/utils/dates'
import { dayPath } from '@/utils/routes'

const router = useRouter()

const today = startOfDay(new Date())
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const dayShortcuts = [
  { date: today, label: 'Today' },
  { date: yesterday, label: 'Yesterday' },
]

const todayEntry = ref<DayListItem | null>(null)

const loadToday = async () => {
  try {
    const response = await daysApi.getDays({
      limit: 1,
      filters: {
        createdAfter: toTimestamp(today),
        createdBefore: toTimestamp(endOfDay(today)),
      },
    })
    const found = response.data?.[0]
    todayEntry.value = found ? { ...found, timestamp: found.timestamp * 1000, exists: true } : null
  } catch {
    todayEntry.value = null
  }
}

const showDigest = ref(false)
const digestMode = ref<DigestMode>('today')
const { hasUnread, markSeen } = useDigestUnread()

const openDigest = (mode: DigestMode) => {
  digestMode.value = mode
  showDigest.value = true
  if (mode === 'week') markSeen()
}

onMounted(loadToday)
</script>

<template>
  <aside class="flex flex-col gap-3">
    <!-- Only in the wide layout, where it belongs to the rail. Stacked, it repeats the Settings
         link the nav already carries and lands in an odd spot mid-column. -->
    <ProfileCard class="hidden xl:flex" />

    <DayPickerDropdown
      prompt="Which day are you writing?"
      :selected="today"
      :shortcuts="dayShortcuts"
      @pick="router.push(dayPath($event))"
    >
      <GlintButton
        class="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#5b4bd6_0%,#8b5cf6_55%,#c084fc_100%)] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(139,92,246,0.9)] transition-[translate,scale,box-shadow,filter] duration-150 hover:-translate-y-px hover:shadow-[0_12px_26px_-8px_rgba(139,92,246,1)] hover:brightness-108 active:translate-y-0 active:scale-99"
      >
        <font-awesome-icon icon="plus" />
        New entry
      </GlintButton>
    </DayPickerDropdown>

    <TodayCard v-if="todayEntry" :day="todayEntry" @summary="openDigest('today')" />

    <!-- A step above the plain rows and a step below New entry: a tint and a border, no motion. -->
    <button
      type="button"
      class="flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-xl border border-white/18 bg-[linear-gradient(120deg,rgba(99,102,241,0.16),rgba(139,92,246,0.14))] px-3.5 py-2.5 text-white transition-all duration-150 hover:border-white/35 hover:bg-[linear-gradient(120deg,rgba(99,102,241,0.26),rgba(139,92,246,0.22))]"
      @click="openDigest('week')"
    >
      <span class="relative flex">
        <font-awesome-icon icon="wand-magic-sparkles" class="text-lg" />
        <span
          v-if="hasUnread"
          class="absolute -top-[3px] -right-[5px] size-2 rounded-full bg-[#f0506e] shadow-[0_0_0_2px_rgba(10,10,16,0.6)]"
          aria-hidden="true"
        />
      </span>
      <span class="flex min-w-0 flex-col items-start text-left leading-tight">
        <span class="text-sm font-semibold">
          Weekly digest
          <span v-if="hasUnread" class="sr-only">(unread)</span>
        </span>
        <span class="text-[11px] text-white/70">Your week, summarized</span>
      </span>
      <font-awesome-icon icon="angle-right" class="ml-auto" />
    </button>

    <!-- Today's summary and the weekly digest, one sheet with two faces -->
    <DigestSheet v-model="showDigest" :mode="digestMode" :today="todayEntry" />
  </aside>
</template>
