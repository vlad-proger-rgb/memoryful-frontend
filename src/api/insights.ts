import axios from '@/api/client'
import type { ApiResponse, InsightInDB } from '@/types'

export const insightsApi = {
  getInsights(params?: { limit?: number; offset?: number }): Promise<ApiResponse<InsightInDB[]>> {
    return axios.get('/api/insights/', { params })
  },
}

export default insightsApi
