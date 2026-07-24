export interface ChatModelOption {
  id: string
  label: string
  name: string
  provider: string
  supportsTools: boolean
}

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatListItem {
  id: string
  title: string
  createdAt: string
}

export interface ChatDetail extends ChatListItem {
  userId: string
  modelId: string
  messages: ChatMessage[]
  updatedAt: string
  chatModel: ChatModelOption
}

export interface CompletionResult {
  chatId: string
  title: string
  message: ChatMessage
}
