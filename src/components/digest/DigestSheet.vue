<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import weekDigestsApi from '@/api/week-digests'
import AiProviderIcon from '@/components/ai/AiProviderIcon.vue'
import DigestDays from '@/components/digest/DigestDays.vue'
import DigestGenerate from '@/components/digest/DigestGenerate.vue'
import DigestInsights from '@/components/digest/DigestInsights.vue'
import DigestSummary from '@/components/digest/DigestSummary.vue'
import DigestWeekPicker from '@/components/digest/DigestWeekPicker.vue'
import ModalWindow from '@/components/ModalWindow.vue'
import { useDigest, type DigestMode } from '@/composables'
import useAiChatStore from '@/stores/aiChat'
import useUiStore from '@/stores/ui'
import type { DayListItem } from '@/types'
import { dayPath } from '@/utils/routes'

const props = defineProps<{
  modelValue: boolean
  mode: DigestMode
  today?: DayListItem | null
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const close = () => emit('update:modelValue', false)

const isWeek = computed(() => props.mode === 'week')

const {
  period,
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
  load,
  refreshDigest,
} = useDigest(toRef(props, 'mode'))

type Pane = 'summary' | 'insights'

const pane = ref<Pane>('summary')

const panes = [
  { id: 'summary' as const, label: 'Summary', icon: 'align-left' },
  { id: 'insights' as const, label: 'Insights', icon: 'lightbulb' },
]

const todayPath = computed(() => dayPath(new Date(props.today?.timestamp ?? Date.now())))

const uiStore = useUiStore()
const aiChatStore = useAiChatStore()

const isQueueing = ref(false)

const takenWeeks = computed(() => digests.value.map((d) => d.weekStart))

const emptyState = computed(() => {
  if (!isCurrentWeek.value) {
    return {
      icon: 'wand-magic-sparkles',
      title: `No digest for ${period.value.title}`,
      body: 'Generate one to read the week as a whole.',
    }
  }
  return {
    icon: 'hourglass-half',
    title: 'This week is still running',
    body: digests.value.length
      ? 'A week is digested once it ends. Pick an earlier one to read.'
      : 'A week is digested once it ends, so there is nothing here yet.',
  }
})

const requestDigest = async (weekStart: string) => {
  isQueueing.value = true
  try {
    await weekDigestsApi.requestWeekDigest(weekStart)
    const landed = await refreshDigest(weekStart)
    uiStore.showToast(
      landed ? 'Digest ready' : 'Still generating — reopen in a moment',
      landed ? 'success' : 'info',
    )
  } catch (e: unknown) {
    uiStore.showToast((e as { msg?: string })?.msg || 'Could not queue the digest', 'error')
  } finally {
    isQueueing.value = false
  }
}

const discuss = () => {
  const current = digest.value
  if (current) {
    aiChatStore.attach({
      label: `Weekly digest · ${period.value.title}`,
      icon: 'wand-magic-sparkles',
      content: [
        `Weekly digest for ${period.value.subtitle} — "${current.title}"`,
        current.summary,
        ...current.sections.map((s) => `- ${s.description}: ${s.content}`),
      ].join('\n'),
    })
  }
  close()
  aiChatStore.open()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  },
)
</script>

<template>
  <ModalWindow
    :model-value="modelValue"
    max-width="4xl"
    flush
    fixed-height
    footer-mobile-only
    :eyebrow="isWeek ? 'Weekly digest' : 'Day summary'"
    :title="digest?.title ?? period.title"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #subtitle>
      <p
        v-if="!isWeek || digest"
        class="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-white/60"
      >
        <span>{{ period.subtitle }}</span>
        <template v-if="authorModel">
          <span class="text-white/25">·</span>
          <span class="inline-flex items-center gap-1.5">
            <AiProviderIcon :provider="authorModel.provider" class="text-[13px]" />
            {{ authorModel.label }}
          </span>
        </template>
      </p>
    </template>

    <div class="flex min-h-0 flex-1 flex-col md:flex-row">
      <nav
        class="shrink-0 border-b border-white/8 px-5 py-3 md:w-52 md:border-r md:border-b-0 md:px-4 md:py-4"
      >
        <div v-if="isWeek && weekOptions.length > 1" class="mb-3">
          <DigestWeekPicker v-model="selectedWeekStart" :options="weekOptions" />
        </div>

        <div v-if="isWeek" class="flex gap-1.5 md:flex-col">
          <button
            v-for="item in panes"
            :key="item.id"
            type="button"
            class="flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition md:flex-none"
            :class="
              pane === item.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:bg-white/5 hover:text-white/80'
            "
            @click="pane = item.id"
          >
            <font-awesome-icon :icon="item.icon" class="w-4 shrink-0 text-xs" />
            {{ item.label }}
          </button>
        </div>

        <div v-if="isWeek" class="mt-4 hidden border-t border-white/8 pt-4 md:block">
          <p class="grid grid-cols-2 gap-2">
            <span v-for="stat in stats" :key="stat.label" class="block">
              <span class="block text-lg leading-tight font-semibold">
                {{ stat.value }}
              </span>
              <span class="block text-[11px] text-white/35">{{ stat.label }}</span>
            </span>
          </p>
        </div>

        <div class="mt-4 hidden space-y-1.5 md:block">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            @click="discuss"
          >
            <font-awesome-icon icon="comments" class="w-4 shrink-0 text-xs" />
            Discuss with AI
          </button>

          <RouterLink
            v-if="!isWeek && today"
            :to="todayPath"
            class="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            @click="close"
          >
            <font-awesome-icon icon="book-open" class="w-4 shrink-0 text-xs" />
            Open the day
          </RouterLink>
        </div>

        <DigestGenerate
          v-if="isWeek"
          class="mt-3 md:mt-4"
          :taken="takenWeeks"
          :busy="isQueueing"
          @generate="requestDigest"
        />
      </nav>

      <div class="digest-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
        <div v-if="isLoading" class="space-y-2">
          <span v-for="n in 3" :key="n" class="block h-14 animate-pulse rounded-xl bg-white/5" />
        </div>

        <template v-else-if="!isWeek">
          <section v-if="today" class="mb-5 rounded-xl border border-white/8 bg-white/4 p-4">
            <p class="text-[15px] leading-relaxed text-white/85">
              {{ today.description || 'Written, no description yet' }}
            </p>
          </section>

          <DigestInsights
            :observations="insights"
            :suggestions="suggestions"
            :empty-noun="period.noun"
          />
        </template>

        <!-- The outgoing pane leaves the flow, so the box takes the new height at once. -->
        <div v-else class="relative">
          <Transition
            enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
            leave-active-class="absolute inset-x-0 top-0 transition duration-150 ease-in motion-reduce:transition-none"
            enter-from-class="translate-y-1 opacity-0"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <div :key="`${pane}-${selectedWeekStart}`">
              <DigestSummary v-if="pane === 'summary' && digest" :digest="digest" />

              <div
                v-else-if="pane === 'summary'"
                class="flex flex-col items-center gap-2 py-12 text-center"
              >
                <span
                  class="mb-1 inline-flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40"
                >
                  <font-awesome-icon :icon="emptyState.icon" />
                </span>
                <p class="font-medium">{{ emptyState.title }}</p>
                <p class="max-w-xs text-[13px] leading-relaxed text-white/45">
                  {{ emptyState.body }}
                </p>
              </div>

              <DigestDays v-else :week-days="weekDays" :days="days" @navigate="close" />
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- The rail is desktop-only, so its actions repeat here -->
    <template #footer>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex flex-1 min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/75 transition hover:bg-white/10"
          @click="discuss"
        >
          <font-awesome-icon icon="comments" class="text-xs" />
          Discuss
        </button>

        <RouterLink
          v-if="!isWeek && today"
          :to="todayPath"
          class="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/75 transition hover:bg-white/10"
          @click="close"
        >
          <font-awesome-icon icon="book-open" class="text-xs" />
          Open the day
        </RouterLink>
      </div>
    </template>
  </ModalWindow>
</template>

<style scoped>
.digest-scroll {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
}

.digest-scroll::-webkit-scrollbar {
  width: 6px;
}

.digest-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}
</style>
