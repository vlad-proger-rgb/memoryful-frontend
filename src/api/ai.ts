import axios from '@/api/client'
import type { ApiResponse } from '@/types'
import type { ChatListItem, ChatDetail, CompletionResult } from '@/types/chat'

export interface CompletionPayload {
  chatId?: string | null
  modelId?: string | null
  content: string
}

export const aiApi = {
  getChats(params?: { limit?: number; offset?: number; query?: string }): Promise<ApiResponse<ChatListItem[]>> {
    return axios.get('/ai/chats/', { params })
  },
  getChat(id: string): Promise<ApiResponse<ChatDetail>> {
    return axios.get(`/ai/chats/${id}`)
  },
  createChat(modelId: string, title = 'New chat'): Promise<ApiResponse<ChatDetail>> {
    return axios.post('/ai/chats/', { modelId, title, messages: [] })
  },
  renameChat(id: string, title: string): Promise<ApiResponse<null>> {
    return axios.put(`/ai/chats/${id}`, { title })
  },
  deleteChat(id: string): Promise<ApiResponse<null>> {
    return axios.delete(`/ai/chats/${id}`)
  },
  createCompletion(payload: CompletionPayload): Promise<ApiResponse<CompletionResult>> {
    return axios.post('/ai/completions/', payload)
  },
}

export default aiApi
