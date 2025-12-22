import axios from '@/api/client'
import type { ApiResponse, TrackableType, TrackableTypeCreate, TrackableTypeUpdate } from '@/types'

export const trackableTypesApi = {
  getTrackableTypes(): Promise<ApiResponse<TrackableType[]>> {
    return axios.get('/api/trackable-types/')
  },
  getTrackableTypeById(id: string): Promise<ApiResponse<TrackableType>> {
    return axios.get(`/api/trackable-types/${id}`)
  },
  createTrackableType(data: TrackableTypeCreate): Promise<ApiResponse<string>> {
    return axios.post('/api/trackable-types/', data)
  },
  updateTrackableType(id: string, data: TrackableTypeUpdate): Promise<ApiResponse<null>> {
    return axios.put(`/api/trackable-types/${id}`, data)
  },
  deleteTrackableType(id: string): Promise<ApiResponse<null>> {
    return axios.delete(`/api/trackable-types/${id}`)
  },
}

export default trackableTypesApi
