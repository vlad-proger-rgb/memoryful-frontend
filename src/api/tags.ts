import axios from 'axios'
import type { ApiResponse, Tag } from '@/types'

export const tagsApi = {
  getTags(): Promise<ApiResponse<Tag[]>> {
    return axios.get('/api/tags/')
  },
  getTagById(id: string): Promise<ApiResponse<Tag>> {
    // ???
    return axios.get(`/api/tags/${id}`)
  },
  createTag(tag: Tag): Promise<ApiResponse<Tag>> {
    return axios.post('/api/tags', tag)
  },
  updateTag(tag: Tag): Promise<ApiResponse<Tag>> {
    return axios.put(`/api/tags/${tag.id}`, tag)
  },
  deleteTag(tagId: string): Promise<ApiResponse<Tag>> {
    return axios.delete(`/api/tags/${tagId}`)
  },
}

export default tagsApi
