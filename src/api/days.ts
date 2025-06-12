import axios from 'axios'
import type { DayListItem, DayDetail, ApiResponse, DayCreate, DayUpdate, DayFilters } from '@/types'

export const daysApi = {
  getDays(params: {
    limit?: number
    offset?: number
    sortField?: 'timestamp' | 'steps' | 'created_at' | 'updated_at'
    sortOrder?: 'asc' | 'desc'
    view?: 'list' | 'detail'
    tagNames?: string[]
    filters?: DayFilters
  }): Promise<ApiResponse<DayListItem[]>> {
    const {
      limit = 10,
      offset = 0,
      sortField,
      sortOrder,
      view = 'list',
      tagNames,
      filters,
    } = params
    const query: Record<string, string | number> = { limit, offset, view }
    if (sortField) query.sortField = sortField
    if (sortOrder) query.sortOrder = sortOrder
    if (tagNames) query.tagNames = JSON.stringify(tagNames)
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
