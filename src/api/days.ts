import axios from 'axios'
import type { DayListItem, DayDetail, ApiResponse, DayCreate, DayUpdate } from '@/types'

export const daysApi = {
  getDays(params: {
    limit?: number
    offset?: number
    sortBy?: string
    view?: 'list' | 'detail'
    filters?: Record<string, string>
  }): Promise<ApiResponse<DayListItem[]>> {
    const { limit = 10, offset = 0, sortBy, view = 'list', filters } = params
    const query: Record<string, string | number> = { limit, offset, view }
    if (sortBy) query.sortBy = sortBy
    if (filters) query.filters = JSON.stringify(filters)

    const cleanedQuery = Object.fromEntries(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    )

    const searchParams = new URLSearchParams(cleanedQuery).toString()
    return axios.get(`/api/days/?${searchParams}`)
  },
  getDayDetail(timestamp: number): Promise<ApiResponse<DayDetail>> {
    return axios.get(`/api/days/${timestamp}`)
  },
  createDay(timestamp: number, day: DayCreate): Promise<ApiResponse<null>> {
    return axios.post(`/api/days/${timestamp}`, day)
  },
  updateDay(timestamp: number, day: DayUpdate): Promise<ApiResponse<null>> {
    return axios.put(`/api/days/${timestamp}`, day)
  },
  toggleStarred(timestamp: number): Promise<ApiResponse<null>> {
    return axios.patch(`/api/days/${timestamp}/toggle-starred`)
  },
  // deleteDay(timestamp: number): Promise<ApiResponse<null>> {
  //   return axios.delete(`/api/days/${timestamp}`)
  // },
}

export default daysApi
