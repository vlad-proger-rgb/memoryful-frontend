import axios from '@/api/client'
import type { ApiResponse, Tag } from '@/types'

type TagPayload = Omit<Tag, 'id'>

export const tagsApi = {
  getTags(): Promise<ApiResponse<Tag[]>> {
    return axios.get('/tags/')
  },
  getTagById(id: string): Promise<ApiResponse<Tag>> {
    // ???
    return axios.get(`/tags/${id}`)
  },
  createTag(tag: TagPayload): Promise<ApiResponse<string>> {
    return axios.post('/tags/', tag)
  },
  updateTag(tagId: string, tag: TagPayload): Promise<ApiResponse<null>> {
    return axios.put(`/tags/${tagId}`, tag)
  },
  deleteTag(tagId: string): Promise<ApiResponse<Tag>> {
    return axios.delete(`/tags/${tagId}`)
  },
}

export default tagsApi
