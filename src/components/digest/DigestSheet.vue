<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, toRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useEventListener, useScrollLock } from '@vueuse/core'

import weekDigestsApi from '@/api/week-digests'
import AiProviderIcon from '@/components/ai/AiProviderIcon.vue'
import DigestDays from '@/components/digest/DigestDays.vue'
import DigestGenerate from '@/components/digest/DigestGenerate.vue'
import DigestInsights from '@/components/digest/DigestInsights.vue'
import DigestSummary from '@/components/digest/DigestSummary.vue'
import DigestWeekPicker from '@/components/digest/DigestWeekPicker.vue'
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

const panel = ref<HTMLElement | null>(null)
const scrollLock = useScrollLock(document.body)

useEventListener('keydown', (event: KeyboardEvent) => {
  if (props.modelValue && event.key === 'Escape') close()
})

watch(
  () => props.modelValue,
  (open) => {
    scrollLock.value = open
    if (!open) return
    load()
    nextTick(() => panel.value?.focus())
  },
)

onBeforeUnmount(() => {
  scrollLock.value = false
})
</script>

<template>
  <Teleport to="#modal">
    <div
      class="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6"
      :class="{ 'pointer-events-none': !modelValue }"
    >
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="modelValue"
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="close"
        />
      </Transition>

      <!-- Sibling of the backdrop: a leaving subtree never runs its children's transitions. -->
      <Transition
        enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
        leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
        enter-from-class="translate-y-full md:translate-y-0 md:-translate-x-10 md:opacity-0"
        leave-to-class="translate-y-full md:translate-y-0 md:translate-x-10 md:opacity-0"
      >
        <div
          v-if="modelValue"
          ref="panel"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          :aria-label="isWeek ? 'Weekly digest' : 'Day summary'"
          class="relative flex max-h-[92dvh] w-full flex-col overflow-clip rounded-t-2xl border border-b-0 border-white/10 bg-[#0b0b0f]/95 text-white shadow-2xl shadow-black/80 backdrop-blur-2xl focus:outline-none md:h-[82dvh] md:max-h-none md:max-w-4xl md:rounded-2xl md:border-b"
        >
          <header
            class="relative shrink-0 border-b border-white/8 px-5 pt-2.5 pb-4 md:px-6 md:pt-5"
          >
            <span class="mx-auto mb-2.5 block h-1 w-9 rounded-full bg-white/15 md:hidden" />

            <button
              type="button"
              class="absolute top-3 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white md:top-5"
              aria-label="Close"
              @click="close"
            >
              <font-awesome-icon icon="xmark" />
            </button>

            <p class="text-[11px] tracking-[0.1em] text-white/35 uppercase">
              {{ isWeek ? 'Weekly digest' : 'Day summary' }}
            </p>
            <h2 class="mt-1 pr-10 text-xl font-semibold tracking-tight md:text-2xl">
              {{ digest?.title ?? period.title }}
            </h2>
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
          </header>

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
                <span
                  v-for="n in 3"
                  :key="n"
                  class="block h-14 animate-pulse rounded-xl bg-white/5"
                />
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
          <footer
            class="shrink-0 border-t border-white/8 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden"
          >
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
          </footer>
        </div>
      </Transition>
    </div>
  </Teleport>
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
