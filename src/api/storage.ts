import axios from '@/api/client'
import type { ApiResponse } from '@/types'
import { viaDevProxy } from '@/utils/storageUrl'

export type StorageUploadIntent =
  | 'avatar'
  | 'day_main'
  | 'day_image'
  | 'month_image'
  | 'workspace_asset'

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
  async presignPut(body: PresignPutRequest): Promise<ApiResponse<PresignPutResponse>> {
    const res: ApiResponse<PresignPutResponse> = await axios.post('/storage/presign-put', body)
    if (res.data) res.data.uploadUrl = viaDevProxy(res.data.uploadUrl)
    return res
  },
  async presignGet(body: PresignGetRequest): Promise<ApiResponse<PresignGetResponse>> {
    const res: ApiResponse<PresignGetResponse> = await axios.post('/storage/presign-get', body)
    if (res.data) res.data.downloadUrl = viaDevProxy(res.data.downloadUrl)
    return res
  },
}

export default storageApi
