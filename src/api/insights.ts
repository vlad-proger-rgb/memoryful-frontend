import axios from '@/api/client'
import type { ApiResponse, InsightInDB, InsightKind } from '@/types'

export const insightsApi = {
  getInsights(params?: {
    limit?: number
    offset?: number
    timestamp?: number
    kind?: InsightKind
  }): Promise<ApiResponse<InsightInDB[]>> {
    return axios.get('/insights/', { params })
  },
}

export default insightsApi
