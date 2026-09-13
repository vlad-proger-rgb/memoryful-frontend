import { ref } from 'vue'
import { defineStore } from 'pinia'

import { aiModelPreferencesApi } from '@/api'
import { useApiError } from '@/composables'
import type { ApiResponse } from '@/types'
import type { AiModelPreferences, AnalysisPurpose } from '@/types/ai'

export const useAiPreferencesStore = defineStore('aiPreferences', () => {
  const { errorMessage, isLoading, withLoading } = useApiError()

  const modelPreferences = ref<AiModelPreferences | null>(null)
  // Which purpose is mid-save, so one field can spin without freezing the others.
  const savingPurpose = ref<AnalysisPurpose | null>(null)

  async function load(request: () => Promise<ApiResponse<AiModelPreferences>>) {
    return await withLoading(async () => {
      const res = await request()
      if (res.code === 200 && res.data) {
        modelPreferences.value = res.data
        return true
      }
      return false
    })
  }

  const fetchModelPreferences = () => load(aiModelPreferencesApi.getMyModelPreferences)

  async function setPurposeModel(purpose: AnalysisPurpose, modelId: string | null) {
    savingPurpose.value = purpose
    try {
      return await load(() => aiModelPreferencesApi.setMyModelPreference(purpose, modelId))
    } finally {
      savingPurpose.value = null
    }
  }

  return {
    modelPreferences,
    savingPurpose,
    errorMessage,
    isLoading,
    fetchModelPreferences,
    setPurposeModel,
  }
})

export default useAiPreferencesStore
