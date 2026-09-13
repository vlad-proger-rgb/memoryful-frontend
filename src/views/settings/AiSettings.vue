<script setup lang="ts">
import { computed, onMounted } from 'vue'

import AiPurposeModelField from '@/components/ai/AiPurposeModelField.vue'
import useAiPreferencesStore from '@/stores/aiPreferences'
import { useAiChatStore } from '@/stores/aiChat'
import useUiStore from '@/stores/ui'
import type { AnalysisPurpose } from '@/types/ai'

const preferences = useAiPreferencesStore()
const chatStore = useAiChatStore()
const uiStore = useUiStore()

const purposeCopy: Record<AnalysisPurpose, { label: string; description: string }> = {
  day: {
    label: 'Daily insights and suggestions',
    description: 'Runs on one day at a time — a light, cheap model is usually enough.',
  },
  week: {
    label: 'Weekly digest',
    description: 'Reads a whole week at once, so a stronger model earns its cost here.',
  },
}

const purposes = computed(() => Object.keys(purposeCopy) as AnalysisPurpose[])

onMounted(() => {
  preferences.fetchModelPreferences()
  if (!chatStore.chatModels.length) chatStore.fetchChatModels()
})

const applyModel = async (purpose: AnalysisPurpose, modelId: string | null) => {
  const ok = await preferences.setPurposeModel(purpose, modelId)
  if (!ok) {
    uiStore.showToast(preferences.errorMessage || 'Failed to save the model', 'error')
    return
  }
  uiStore.showToast(`${purposeCopy[purpose].label} updated`, 'success')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="text-xl font-semibold">AI Settings</p>
      <p class="text-sm opacity-80">
        Choose which model writes your summaries. Chats, privacy controls and embeddings are still
        on the way.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-4">
        <div>
          <p class="font-semibold">Generation models</p>
          <p class="text-sm opacity-80">
            Each kind of summary picks its own model. Leave one on the default and it follows
            whatever Memoryful recommends.
          </p>
        </div>

        <AiPurposeModelField
          v-for="purpose in purposes"
          :key="purpose"
          :label="purposeCopy[purpose].label"
          :description="purposeCopy[purpose].description"
          :models="chatStore.chatModels"
          :selection="preferences.modelPreferences?.[purpose] ?? null"
          :saving="preferences.savingPurpose === purpose"
          @select="applyModel(purpose, $event)"
          @reset="applyModel(purpose, null)"
        />

        <p class="text-xs opacity-70">
          A change applies to the next summary generated; anything already written keeps the model
          that wrote it.
        </p>
      </section>

      <section
        class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3 opacity-60"
      >
        <div>
          <p class="font-semibold">Privacy &amp; Data Access</p>
          <p class="text-sm opacity-80">Restrict what data AI is allowed to use.</p>
        </div>

        <div class="text-sm opacity-80">
          Coming soon:
          <div class="text-xs opacity-70 mt-1">- Calendar - Days - Search</div>
        </div>
      </section>

      <section
        class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3 opacity-60"
      >
        <div>
          <p class="font-semibold">Chats</p>
          <p class="text-sm opacity-80">Manage stored chats and conversation history.</p>
        </div>

        <div class="text-sm opacity-80">
          Coming soon:
          <div class="text-xs opacity-70 mt-1">
            - List conversations - Delete conversation - Export conversation
          </div>
        </div>

        <button
          class="bg-white/15 rounded-full px-4 py-2 min-h-11 md:min-h-0 text-sm w-fit cursor-not-allowed"
          disabled
        >
          Open Chats Manager
        </button>
      </section>

      <section
        class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3 opacity-60"
      >
        <div>
          <p class="font-semibold">Embeddings / Similarity Search</p>
          <p class="text-sm opacity-80">Control indexing and similarity search behavior.</p>
        </div>

        <div class="text-sm opacity-80">
          Coming soon:
          <div class="text-xs opacity-70 mt-1">
            - Rebuild embeddings - Index status - Exclude data sources
          </div>
        </div>

        <button
          class="bg-white/15 rounded-full px-4 py-2 min-h-11 md:min-h-0 text-sm w-fit cursor-not-allowed"
          disabled
        >
          Manage Embeddings
        </button>
      </section>
    </div>
  </div>
</template>
