import axios from '@/api/client'
import type { ApiResponse, Tag } from '@/types'

type TagPayload = Omit<Tag, 'id'>

export const tagsApi = {
  getTags(): Promise<ApiResponse<Tag[]>> {
    return axios.get('/api/tags/')
  },
  getTagById(id: string): Promise<ApiResponse<Tag>> {
    // ???
    return axios.get(`/api/tags/${id}`)
  },
  createTag(tag: TagPayload): Promise<ApiResponse<string>> {
    return axios.post('/api/tags/', tag)
  },
  updateTag(tagId: string, tag: TagPayload): Promise<ApiResponse<null>> {
    return axios.put(`/api/tags/${tagId}`, tag)
  },
  deleteTag(tagId: string): Promise<ApiResponse<Tag>> {
    return axios.delete(`/api/tags/${tagId}`)
  },
}

export default tagsApi
