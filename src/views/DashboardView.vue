<script setup lang="ts">
import useWorkspaceStore from '@/stores/workspace'
import useUiStore from '@/stores/ui'
import MediaBackground from '@/components/ui/MediaBackground.vue'
import { useResolvedStorageMedia } from '@/composables/useResolvedStorageMedia'
import { computed, onActivated, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { insightsApi, suggestionsApi } from '@/api'
import type { InsightInDB, SuggestionInDB } from '@/types'
import { getIcon } from '@/plugins/fontawesome'
import ModalWindow from '@/components/ModalWindow.vue'

const workspaceStore = useWorkspaceStore()
const uiStore = useUiStore()

uiStore.disableScroll = true

const { url: backgroundUrl, isVideo: isBackgroundVideo } = useResolvedStorageMedia(
  () => workspaceStore.settings.dashboardBackground,
)

const todayPath = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  return `/calendar/${year}/${month}/${day}`
})

const rawInsights = ref<InsightInDB[]>([])
const rawSuggestions = ref<SuggestionInDB[]>([])
const isLoadingAi = ref(false)

const todayIso = computed(() => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
})

const todaysInsightsRaw = computed(() => rawInsights.value.filter((i) => i.dateBegin === todayIso.value))
const todaysSuggestionsRaw = computed(() => rawSuggestions.value.filter((s) => s.date === todayIso.value))

const insightsPreview = computed(() => todaysInsightsRaw.value.slice(0, 3))
const suggestionsPreview = computed(() => todaysSuggestionsRaw.value.slice(0, 3))

const getInsightIcon = (item: InsightInDB): [string, string] => {
  return item.icon ? (getIcon(item.icon) as [string, string]) : (['fas', 'lightbulb'] as [string, string])
}

const getSuggestionIcon = (item: SuggestionInDB): [string, string] => {
  return item.icon
    ? (getIcon(item.icon) as [string, string])
    : (['fas', 'wand-magic-sparkles'] as [string, string])
}

type AiModalMode = 'insights' | 'suggestions'
const showAiModal = ref(false)
const aiModalMode = ref<AiModalMode>('insights')

const aiModalTitle = computed(() => (aiModalMode.value === 'insights' ? 'Insights' : 'Suggestions'))
const aiModalItems = computed(() =>
  aiModalMode.value === 'insights' ? todaysInsightsRaw.value : todaysSuggestionsRaw.value,
)

const openAiModal = (mode: AiModalMode, itemId?: string) => {
  aiModalMode.value = mode
  showAiModal.value = true
  if (itemId) {
    if (mode === 'insights') {
      expandedInsightIds.value.add(itemId)
    } else {
      expandedSuggestionIds.value.add(itemId)
    }
  }
}

const expandedInsightIds = ref(new Set<string>())
const expandedSuggestionIds = ref(new Set<string>())

const isInsightExpanded = (id: string) => expandedInsightIds.value.has(id)
const isSuggestionExpanded = (id: string) => expandedSuggestionIds.value.has(id)

const toggleInsight = (id: string) => {
  if (expandedInsightIds.value.has(id)) expandedInsightIds.value.delete(id)
  else expandedInsightIds.value.add(id)
}

const toggleSuggestion = (id: string) => {
  if (expandedSuggestionIds.value.has(id)) expandedSuggestionIds.value.delete(id)
  else expandedSuggestionIds.value.add(id)
}

const areAllTodaysInsightsExpanded = computed(() => {
  const items = todaysInsightsRaw.value
  if (!items.length) return false
  return items.every((i) => expandedInsightIds.value.has(i.id))
})

const areAllTodaysSuggestionsExpanded = computed(() => {
  const items = todaysSuggestionsRaw.value
  if (!items.length) return false
  return items.every((s) => expandedSuggestionIds.value.has(s.id))
})

const toggleAllInsights = () => {
  if (areAllTodaysInsightsExpanded.value) {
    expandedInsightIds.value.clear()
    return
  }

  expandedInsightIds.value = new Set(todaysInsightsRaw.value.map((i) => i.id))
}

const toggleAllSuggestions = () => {
  if (areAllTodaysSuggestionsExpanded.value) {
    expandedSuggestionIds.value.clear()
    return
  }

  expandedSuggestionIds.value = new Set(todaysSuggestionsRaw.value.map((s) => s.id))
}

const beforeEnterCollapse = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.opacity = '0'
}

const enterCollapse = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = '1'
}

const afterEnterCollapse = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = 'auto'
}

const beforeLeaveCollapse = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = '1'
}

const leaveCollapse = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.opacity = '0'
}

const loadAi = async () => {
  isLoadingAi.value = true
  try {
    const [ins, sug] = await Promise.all([
      insightsApi.getInsights({ limit: 50, offset: 0 }),
      suggestionsApi.getSuggestions({ limit: 50, offset: 0 }),
    ])
    rawInsights.value = ins.data || []
    rawSuggestions.value = sug.data || []
  } finally {
    isLoadingAi.value = false
  }
}

onMounted(() => {
  loadAi()
})

onActivated(() => {
  loadAi()
})
</script>

<template>
  <div class="relative h-screen w-full overflow-hidden font-dashboard">
    <MediaBackground
      :src="backgroundUrl"
      :is-video="isBackgroundVideo"
      class-name="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
      fallback-class-name="fixed inset-0 w-full h-full z-0 bg-black"
    />

    <div class="relative z-10 pt-8 pb-8 px-5">
      <div class="mx-auto max-w-[1400px]">
        <div class="grid grid-cols-12 gap-6">
          <section
            class="col-span-12 lg:col-span-8 glass-card glass-card-lg"
            aria-label="Productivity Week"
          >
            <h2 class="section-title">Productivity Week</h2>

            <div class="mt-8 flex items-center justify-center gap-12 flex-wrap">
              <div class="stat-col">
                <font-awesome-icon icon="person-walking" class="text-[44px] text-lime-400 drop-shadow" />
                <div class="stat-val">+32%</div>
              </div>
              <div class="stat-col">
                <font-awesome-icon icon="code" class="text-[44px] text-blue-500 drop-shadow" />
                <div class="stat-val">+38%</div>
              </div>
              <div class="stat-col">
                <font-awesome-icon icon="book" class="text-[44px] text-cyan-300 drop-shadow" />
                <div class="stat-val">+27%</div>
              </div>
              <div class="stat-col">
                <font-awesome-icon icon="gamepad" class="text-[44px] text-red-500 drop-shadow" />
                <div class="stat-val">-11%</div>
              </div>
            </div>

            <div class="mt-8 flex justify-center">
              <button type="button" class="pill-button text-[24px]">
                <span>More</span>
                <font-awesome-icon icon="arrow-right-long" class="text-[24px]" />
              </button>
            </div>
          </section>

          <section class="col-span-12 lg:col-span-4 glass-card" aria-label="Today">
            <h2 class="section-title">Today</h2>

            <div class="mt-6 flex flex-col gap-4">
              <RouterLink :to="todayPath" class="pill-button pill-button-sm">
                <span>Open</span>
                <font-awesome-icon icon="angle-right" class="text-[26px]" />
              </RouterLink>
              <button type="button" class="pill-button pill-button-sm">
                <span>Discuss</span>
                <font-awesome-icon icon="angle-right" class="text-[26px]" />
              </button>
              <button type="button" class="pill-button pill-button-sm">
                <span>Summary</span>
                <font-awesome-icon icon="angle-right" class="text-[26px]" />
              </button>
            </div>
          </section>

          <section class="col-span-12 lg:col-span-6 glass-card" aria-label="Insights">
            <div class="flex items-center justify-between">
              <h2 class="section-title !text-left !w-auto">Insights</h2>
              <div class="flex items-center gap-3">
                <button
                  v-if="todaysInsightsRaw.length"
                  type="button"
                  class="pill-button pill-button-sm !w-auto"
                  @click="toggleAllInsights"
                >
                  <span>{{ areAllTodaysInsightsExpanded ? 'Collapse all' : 'Expand all' }}</span>
                </button>
                <button
                  type="button"
                  class="pill-button pill-button-sm !w-auto"
                  @click="openAiModal('insights')"
                >
                  <span>View all</span>
                  <font-awesome-icon icon="angle-right" class="text-[26px]" />
                </button>
              </div>
            </div>
            <div class="mt-8 flex flex-col gap-4">
              <div v-if="isLoadingAi" class="text-white/70 text-center">Loading...</div>
              <div
                v-else-if="!todaysInsightsRaw.length"
                class="text-white/70 text-center"
              >
                No insights for today yet - write the day and mark it as complete to generate.
              </div>
              <div v-for="item in insightsPreview" :key="item.id" class="flex flex-col gap-3">
                <button
                  type="button"
                  class="flex items-center justify-between gap-3.5 px-3 py-2 rounded-full bg-white/20 backdrop-blur-[17.5px] text-white no-underline transition hover:bg-white/30 hover:-translate-y-px"
                  @click="toggleInsight(item.id)"
                  :aria-expanded="isInsightExpanded(item.id)"
                >
                  <span class="w-8 h-8 inline-flex items-center justify-center text-[22px] text-white/90">
                    <font-awesome-icon :icon="getInsightIcon(item)" class="text-[22px]" />
                  </span>
                  <span class="flex-1 min-w-0 text-[16px] text-center leading-[1.25]">{{ item.description }}</span>
                  <font-awesome-icon
                    icon="angle-down"
                    class="text-[22px] opacity-90 transition-transform duration-200"
                    :class="isInsightExpanded(item.id) ? 'rotate-180' : ''"
                  />
                </button>

                <Transition
                  name="collapse"
                  @before-enter="beforeEnterCollapse"
                  @enter="enterCollapse"
                  @after-enter="afterEnterCollapse"
                  @before-leave="beforeLeaveCollapse"
                  @leave="leaveCollapse"
                >
                  <div
                    v-if="isInsightExpanded(item.id)"
                    class="rounded-2xl bg-white/12 backdrop-blur-[17.5px] px-4 py-3 overflow-hidden"
                  >
                    <div class="text-white/80 whitespace-pre-line">{{ item.content }}</div>
                  </div>
                </Transition>
              </div>
            </div>
          </section>

          <section class="col-span-12 lg:col-span-6 glass-card" aria-label="Suggestions">
            <div class="flex items-center justify-between">
              <h2 class="section-title !text-left !w-auto">Suggestions</h2>
              <div class="flex items-center gap-3">
                <button
                  v-if="todaysSuggestionsRaw.length"
                  type="button"
                  class="pill-button pill-button-sm !w-auto"
                  @click="toggleAllSuggestions"
                >
                  <span>{{ areAllTodaysSuggestionsExpanded ? 'Collapse all' : 'Expand all' }}</span>
                </button>
                <button
                  type="button"
                  class="pill-button pill-button-sm !w-auto"
                  @click="openAiModal('suggestions')"
                >
                  <span>View all</span>
                  <font-awesome-icon icon="angle-right" class="text-[26px]" />
                </button>
              </div>
            </div>
            <div class="mt-8 flex flex-col gap-4">
              <div v-if="isLoadingAi" class="text-white/70 text-center">Loading...</div>
              <div
                v-else-if="!todaysSuggestionsRaw.length"
                class="text-white/70 text-center"
              >
                No suggestions for today yet - write the day and mark it as complete to generate.
              </div>
              <div v-for="item in suggestionsPreview" :key="item.id" class="flex flex-col gap-3">
                <button
                  type="button"
                  class="flex items-center justify-between gap-3.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur-[17.5px] text-white no-underline transition hover:bg-white/25 hover:-translate-y-px"
                  @click="toggleSuggestion(item.id)"
                  :aria-expanded="isSuggestionExpanded(item.id)"
                >
                  <span class="w-8 h-8 inline-flex items-center justify-center text-[22px] text-white/90">
                    <font-awesome-icon :icon="getSuggestionIcon(item)" class="text-[22px]" />
                  </span>
                  <span class="flex-1 min-w-0 text-[16px] text-center leading-[1.25]">{{ item.description }}</span>
                  <font-awesome-icon
                    icon="angle-down"
                    class="text-[22px] opacity-90 transition-transform duration-200"
                    :class="isSuggestionExpanded(item.id) ? 'rotate-180' : ''"
                  />
                </button>

                <Transition
                  name="collapse"
                  @before-enter="beforeEnterCollapse"
                  @enter="enterCollapse"
                  @after-enter="afterEnterCollapse"
                  @before-leave="beforeLeaveCollapse"
                  @leave="leaveCollapse"
                >
                  <div
                    v-if="isSuggestionExpanded(item.id)"
                    class="rounded-2xl bg-white/12 backdrop-blur-[17.5px] px-4 py-3 overflow-hidden"
                  >
                    <div class="text-white/80 whitespace-pre-line">{{ item.content }}</div>
                  </div>
                </Transition>
              </div>
            </div>
          </section>

          <ModalWindow v-model="showAiModal" maxWidth="2xl" class="max-h-[90vh] overflow-y-auto">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-white">{{ aiModalTitle }}</h2>
                <div class="flex items-center gap-3">
                  <button
                    v-if="aiModalItems.length"
                    type="button"
                    class="pill-button pill-button-sm !w-auto"
                    @click="aiModalMode === 'insights' ? toggleAllInsights() : toggleAllSuggestions()"
                  >
                    <span>{{
                      aiModalMode === 'insights'
                        ? areAllTodaysInsightsExpanded
                          ? 'Collapse all'
                          : 'Expand all'
                        : areAllTodaysSuggestionsExpanded
                          ? 'Collapse all'
                          : 'Expand all'
                    }}</span>
                  </button>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
                    @click="showAiModal = false"
                    aria-label="Close modal"
                  >
                    <font-awesome-icon icon="times" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </template>

            <template #default>
              <div class="space-y-6">
                <div v-if="!aiModalItems.length" class="text-white/70 text-center">Nothing for today.</div>

                <div v-else>
                  <div v-if="aiModalMode === 'insights'" class="flex flex-col gap-3">
                    <div v-for="item in (aiModalItems as InsightInDB[])" :key="item.id" class="flex flex-col gap-3">
                      <button
                        type="button"
                        class="flex items-center justify-between gap-3.5 px-3 py-2 rounded-full bg-white/20 backdrop-blur-[17.5px] text-white no-underline transition hover:bg-white/30 hover:-translate-y-px"
                        @click="toggleInsight(item.id)"
                        :aria-expanded="isInsightExpanded(item.id)"
                      >
                        <span class="w-8 h-8 inline-flex items-center justify-center text-[22px] text-white/90">
                          <font-awesome-icon :icon="getInsightIcon(item)" class="text-[22px]" />
                        </span>
                        <span class="flex-1 min-w-0 text-[16px] text-center leading-[1.25]">{{ item.description }}</span>
                        <font-awesome-icon
                          icon="angle-down"
                          class="text-[22px] opacity-90 transition-transform duration-200"
                          :class="isInsightExpanded(item.id) ? 'rotate-180' : ''"
                        />
                      </button>

                      <Transition
                        name="collapse"
                        @before-enter="beforeEnterCollapse"
                        @enter="enterCollapse"
                        @after-enter="afterEnterCollapse"
                        @before-leave="beforeLeaveCollapse"
                        @leave="leaveCollapse"
                      >
                        <div
                          v-if="isInsightExpanded(item.id)"
                          class="rounded-2xl bg-white/12 backdrop-blur-[17.5px] px-4 py-3 overflow-hidden"
                        >
                          <div class="text-white/80 whitespace-pre-line">{{ item.content }}</div>
                        </div>
                      </Transition>
                    </div>
                  </div>

                  <div v-else class="flex flex-col gap-3">
                    <div v-for="item in (aiModalItems as SuggestionInDB[])" :key="item.id" class="flex flex-col gap-3">
                      <button
                        type="button"
                        class="flex items-center justify-between gap-3.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur-[17.5px] text-white no-underline transition hover:bg-white/25 hover:-translate-y-px"
                        @click="toggleSuggestion(item.id)"
                        :aria-expanded="isSuggestionExpanded(item.id)"
                      >
                        <span class="w-8 h-8 inline-flex items-center justify-center text-[22px] text-white/90">
                          <font-awesome-icon :icon="getSuggestionIcon(item)" class="text-[22px]" />
                        </span>
                        <span class="flex-1 min-w-0 text-[16px] text-center leading-[1.25]">{{ item.description }}</span>
                        <font-awesome-icon
                          icon="angle-down"
                          class="text-[22px] opacity-90 transition-transform duration-200"
                          :class="isSuggestionExpanded(item.id) ? 'rotate-180' : ''"
                        />
                      </button>

                      <Transition
                        name="collapse"
                        @before-enter="beforeEnterCollapse"
                        @enter="enterCollapse"
                        @after-enter="afterEnterCollapse"
                        @before-leave="beforeLeaveCollapse"
                        @leave="leaveCollapse"
                      >
                        <div
                          v-if="isSuggestionExpanded(item.id)"
                          class="rounded-2xl bg-white/12 backdrop-blur-[17.5px] px-4 py-3 overflow-hidden"
                        >
                          <div class="text-white/80 whitespace-pre-line">{{ item.content }}</div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </ModalWindow>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-dashboard {
  font-family: Verdana, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  border-radius: 50px;
  padding: 34px;
  overflow: hidden;
  color: white;
}

.glass-card-lg {
  min-height: 340px;
}

.section-title {
  font-size: 28px;
  text-align: center;
  width: 100%;
  line-height: 1.2;
}

.stat-col {
  width: 138px;
  height: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.drop-shadow {
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
}

.stat-val {
  font-size: 28px;
  text-align: center;
}

.pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  font-size: 20px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(17.5px);
  -webkit-backdrop-filter: blur(17.5px);
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.pill-button:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: scale(1.03);
}

.pill-button:active {
  transform: scale(0.98);
}

.pill-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.pill-button-sm {
  font-size: 18px;
  justify-content: space-between;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: height 220ms ease, opacity 220ms ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .glass-card {
    padding: 24px;
  }
}

@media (max-width: 640px) {
  .glass-card {
    border-radius: 32px;
  }

  .pill-button-sm {
    font-size: 16px;
  }
}
</style>
