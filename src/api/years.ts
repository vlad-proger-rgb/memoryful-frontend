import axios from '@/api/client'
import type { ApiResponse, Month } from '@/types'
import { viaDevProxy } from '@/utils/storageUrl'

const proxyBackground = (month: Month): void => {
  if (month.resolved?.url) month.resolved.url = viaDevProxy(month.resolved.url)
}

export const yearApi = {
  async getYear(year: number): Promise<ApiResponse<Month[]>> {
    const res: ApiResponse<Month[]> = await axios.get(`/months/${year}`)
    res.data?.forEach(proxyBackground)
    return res
  },
  async getMonth(year: number, monthNumber: number): Promise<ApiResponse<Month>> {
    const res: ApiResponse<Month> = await axios.get(`/months/${year}/${monthNumber}`)
    if (res.data) proxyBackground(res.data)
    return res
  },
  createMonth(month: Month): Promise<ApiResponse<null>> {
    return axios.post(`/months/`, month)
  },
  updateMonth(month: Month): Promise<ApiResponse<null>> {
    return axios.put(`/months/`, month)
  },
}

export default yearApi
