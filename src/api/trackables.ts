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
    return axios.get('/trackables/', { params })
  },
  getTrackableById(id: string): Promise<ApiResponse<TrackableDetail>> {
    return axios.get(`/trackables/${id}`)
  },
  createTrackable(data: TrackableCreate): Promise<ApiResponse<string>> {
    return axios.post('/trackables/', data)
  },
  updateTrackable(id: string, data: TrackableUpdate): Promise<ApiResponse<null>> {
    return axios.put(`/trackables/${id}`, data)
  },
  deleteTrackable(id: string): Promise<ApiResponse<null>> {
    return axios.delete(`/trackables/${id}`)
  },
}

export default trackablesApi
