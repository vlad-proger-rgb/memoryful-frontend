import axios from '@/api/client'
import type { ApiResponse, WeekDigestInDB } from '@/types'

export const weekDigestsApi = {
  /** Newest first. Only weeks that actually have a digest come back. */
  getWeekDigests(params?: {
    limit?: number
    offset?: number
  }): Promise<ApiResponse<WeekDigestInDB[]>> {
    return axios.get('/week-digests/', { params })
  },

  /** `weekStart` is the Monday as an ISO date. */
  getWeekDigest(weekStart: string): Promise<ApiResponse<WeekDigestInDB>> {
    return axios.get(`/week-digests/${weekStart}`)
  },

  /** Queues a digest. `weekStart` may be any date in the target week. */
  requestWeekDigest(weekStart?: string): Promise<ApiResponse<null>> {
    return axios.post('/week-digests/generate', null, {
      params: weekStart ? { weekStart } : undefined,
    })
  },
}

export default weekDigestsApi
