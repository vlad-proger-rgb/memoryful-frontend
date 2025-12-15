import axios from '@/api/client'
import type { ApiResponse } from '@/types'

export type StorageUploadIntent = 'avatar' | 'day_main' | 'day_image' | 'month_image' | 'workspace_asset'

export interface PresignPutRequest {
  intent: StorageUploadIntent
  filename: string
  contentType: string
  dayTimestamp?: number
  year?: number
  month?: number
  workspacePageKey?: string
}

export interface PresignPutResponse {
  uploadUrl: string
  objectKey: string
}

export interface PresignGetRequest {
  objectKey: string
}

export interface PresignGetResponse {
  downloadUrl: string
}

export const storageApi = {
  presignPut(body: PresignPutRequest): Promise<ApiResponse<PresignPutResponse>> {
    return axios.post('/api/storage/presign-put', body)
  },
  presignGet(body: PresignGetRequest): Promise<ApiResponse<PresignGetResponse>> {
    return axios.post('/api/storage/presign-get', body)
  },
}

export default storageApi
