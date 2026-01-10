import axios from '@/api/client'
import type { ApiResponse, SuggestionInDB } from '@/types'

export const suggestionsApi = {
  getSuggestions(params?: { limit?: number; offset?: number }): Promise<ApiResponse<SuggestionInDB[]>> {
    return axios.get('/api/suggestions/', { params })
  },
}

export default suggestionsApi
