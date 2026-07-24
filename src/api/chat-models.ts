import axios from '@/api/client'
import type { ApiResponse } from '@/types'
import type { ChatModelOption } from '@/types/chat'

export const chatModelsApi = {
  getChatModels(): Promise<ApiResponse<ChatModelOption[]>> {
    return axios.get('/ai/chat-models/')
  },
}

export default chatModelsApi
