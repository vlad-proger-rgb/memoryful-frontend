import axios from '@/api/client'
import type { ApiResponse, TrackableType, TrackableTypeCreate, TrackableTypeUpdate } from '@/types'

export const trackableTypesApi = {
  getTrackableTypes(): Promise<ApiResponse<TrackableType[]>> {
    return axios.get('/trackable-types/')
  },
  getTrackableTypeById(id: string): Promise<ApiResponse<TrackableType>> {
    return axios.get(`/trackable-types/${id}`)
  },
  createTrackableType(data: TrackableTypeCreate): Promise<ApiResponse<string>> {
    return axios.post('/trackable-types/', data)
  },
  updateTrackableType(id: string, data: TrackableTypeUpdate): Promise<ApiResponse<null>> {
    return axios.put(`/trackable-types/${id}`, data)
  },
  deleteTrackableType(id: string): Promise<ApiResponse<null>> {
    return axios.delete(`/trackable-types/${id}`)
  },
}

export default trackableTypesApi
