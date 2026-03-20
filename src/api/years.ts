import axios from '@/api/client'
import type { ApiResponse, Month } from '@/types'

export const yearApi = {
  getYear(year: number): Promise<ApiResponse<Month[]>> {
    return axios.get(`/months/${year}`)
  },
  getMonth(year: number, monthNumber: number): Promise<ApiResponse<Month>> {
    return axios.get(`/months/${year}/${monthNumber}`)
  },
  createMonth(month: Month): Promise<ApiResponse<null>> {
    return axios.post(`/months/`, month)
  },
  updateMonth(month: Month): Promise<ApiResponse<null>> {
    return axios.put(`/months/`, month)
  },
}

export default yearApi
