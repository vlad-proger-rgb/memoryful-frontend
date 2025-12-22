import axios from '@/api/client'
import type {
  ApiResponse,
  TrackableCreate,
  TrackableDetail,
  TrackableInDB,
  TrackableUpdate,
} from '@/types'

export const trackablesApi = {
  getTrackables(params?: { typeId?: string; search?: string }): Promise<ApiResponse<TrackableInDB[]>> {
    return axios.get('/api/trackables/', { params })
  },
  getTrackableById(id: string): Promise<ApiResponse<TrackableDetail>> {
    return axios.get(`/api/trackables/${id}`)
  },
  createTrackable(data: TrackableCreate): Promise<ApiResponse<string>> {
    return axios.post('/api/trackables/', data)
  },
  updateTrackable(id: string, data: TrackableUpdate): Promise<ApiResponse<null>> {
    return axios.put(`/api/trackables/${id}`, data)
  },
  deleteTrackable(id: string): Promise<ApiResponse<null>> {
    return axios.delete(`/api/trackables/${id}`)
  },
}

export default trackablesApi
