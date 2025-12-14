<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'

const modelKey = 'ai:selectedModel'
const allowCalendarKey = 'ai:allowCalendar'
const allowSearchKey = 'ai:allowSearch'
const allowDaysKey = 'ai:allowDays'

const availableModels = [
  { id: 'auto', label: 'Auto (recommended)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini (fast)' },
  { id: 'gpt-4o', label: 'GPT-4o (best quality)' },
  { id: 'local', label: 'Local model (future)' },
]

const selectedModel = ref<string>(localStorage.getItem(modelKey) || 'auto')
const isModelDropdownOpen = ref(false)
const modelButtonRef = ref<HTMLElement | null>(null)

const selectedModelLabel = computed(() => {
  return availableModels.find((m) => m.id === selectedModel.value)?.label || selectedModel.value
})

const selectModel = (m: { id: string; label: string }) => {
  selectedModel.value = m.id
  isModelDropdownOpen.value = false
}
const allowCalendar = ref<boolean>((localStorage.getItem(allowCalendarKey) || 'true') === 'true')
const allowSearch = ref<boolean>((localStorage.getItem(allowSearchKey) || 'true') === 'true')
const allowDays = ref<boolean>((localStorage.getItem(allowDaysKey) || 'true') === 'true')

watch(selectedModel, (v) => localStorage.setItem(modelKey, v))
watch(allowCalendar, (v) => localStorage.setItem(allowCalendarKey, String(v)))
watch(allowSearch, (v) => localStorage.setItem(allowSearchKey, String(v)))
watch(allowDays, (v) => localStorage.setItem(allowDaysKey, String(v)))

const privacySummary = computed(() => {
  const allowed = [
    allowCalendar.value ? 'Calendar' : null,
    allowDays.value ? 'Days' : null,
    allowSearch.value ? 'Search' : null,
  ].filter(Boolean)

  return allowed.length ? `AI can access: ${allowed.join(', ')}` : 'AI access restricted: no data sources enabled'
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="text-xl font-semibold">AI Settings</p>
      <p class="text-sm opacity-80">
        Manage model selection, chats, privacy controls, and embeddings/similarity search.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <p class="font-semibold">Model</p>
          <p class="text-sm opacity-80">Choose which model is used to answer.</p>
        </div>

        <div class="relative">
          <button
            ref="modelButtonRef"
            type="button"
            class="w-full text-left bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-2.5 pr-10 outline-none text-sm transition-colors focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
            :aria-expanded="isModelDropdownOpen"
            aria-haspopup="listbox"
            @click="isModelDropdownOpen = true"
          >
            <span class="block truncate">{{ selectedModelLabel }}</span>
          </button>

          <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <BaseAutocomplete
            v-model:show="isModelDropdownOpen"
            :items="availableModels"
            :attach-to="modelButtonRef"
            item-key="id"
            item-label="label"
            @select="selectModel"
          >
            <template #item="{ item }">
              <div class="flex items-center justify-between w-full">
                <span>{{ item.label }}</span>
                <font-awesome-icon v-if="item.id === selectedModel" icon="check" class="text-emerald-300" />
              </div>
            </template>
          </BaseAutocomplete>
        </div>

        <p class="text-xs opacity-70">
          Currently: <span class="font-medium">{{ selectedModel }}</span>
        </p>
      </section>

      <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <p class="font-semibold">Privacy & Data Access</p>
          <p class="text-sm opacity-80">Restrict what data AI is allowed to use.</p>
        </div>

        <label class="flex items-center justify-between gap-3 text-sm">
          <span>Calendar</span>
          <input v-model="allowCalendar" type="checkbox" class="accent-white" />
        </label>
        <label class="flex items-center justify-between gap-3 text-sm">
          <span>Days</span>
          <input v-model="allowDays" type="checkbox" class="accent-white" />
        </label>
        <label class="flex items-center justify-between gap-3 text-sm">
          <span>Search</span>
          <input v-model="allowSearch" type="checkbox" class="accent-white" />
        </label>

        <p class="text-xs opacity-70">{{ privacySummary }}</p>
      </section>

      <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <p class="font-semibold">Chats</p>
          <p class="text-sm opacity-80">Manage stored chats and conversation history.</p>
        </div>

        <div class="text-sm opacity-80">
          Coming soon:
          <div class="text-xs opacity-70 mt-1">
            - List conversations
            - Delete conversation
            - Export conversation
          </div>
        </div>

        <button class="bg-white/15 rounded-full px-4 py-2 text-sm w-fit" disabled>
          Open Chats Manager
        </button>
      </section>

      <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <p class="font-semibold">Embeddings / Similarity Search</p>
          <p class="text-sm opacity-80">Control indexing and similarity search behavior.</p>
        </div>

        <div class="text-sm opacity-80">
          Coming soon:
          <div class="text-xs opacity-70 mt-1">
            - Rebuild embeddings
            - Index status
            - Exclude data sources
          </div>
        </div>

        <button class="bg-white/15 rounded-full px-4 py-2 text-sm w-fit" disabled>
          Manage Embeddings
        </button>
      </section>
    </div>
  </div>
</template>
