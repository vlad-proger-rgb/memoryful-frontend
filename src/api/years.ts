import axios from 'axios'
import type { ApiResponse, Month } from '@/types'

export const yearApi = {
  getYear(year: number): Promise<ApiResponse<Month[]>> {
    return axios.get(`/api/months/${year}/`)
  },
  getMonth(year: number, monthNumber: number): Promise<ApiResponse<Month>> {
    return axios.get(`/api/months/${year}/${monthNumber}`)
  },
  createMonth(month: Month): Promise<ApiResponse<null>> {
    return axios.post(`/api/months/`, month)
  },
  updateMonth(month: Month): Promise<ApiResponse<null>> {
    return axios.put(`/api/months/`, month)
  }
}

export default yearApi
