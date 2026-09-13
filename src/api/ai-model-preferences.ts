import axios from '@/api/client'
import type { ApiResponse } from '@/types'
import type { AiModelPreferences, AnalysisPurpose } from '@/types/ai'

type Response = Promise<ApiResponse<AiModelPreferences>>

export const aiModelPreferencesApi = {
  getMyModelPreferences(): Response {
    return axios.get('/ai/model-preferences/me')
  },
  setMyModelPreference(purpose: AnalysisPurpose, modelId: string | null): Response {
    return axios.put(`/ai/model-preferences/me/${purpose}`, { modelId })
  },
}

export default aiModelPreferencesApi
