export interface ChatModelOption {
  id: string
  label: string
  name: string
  provider: string
  supportsTools: boolean
}

export type ChatRole = 'system' | 'user' | 'assistant'

/** A tool the assistant ran while answering. Streaming-only: not persisted, so it
 *  shows during the reply and is gone when the chat is reloaded. */
export interface ToolActivity {
  name: string
  args?: Record<string, unknown>
  status: 'running' | 'done'
}

export interface ChatMessage {
  role: ChatRole
  content: string
  tools?: ToolActivity[]
  /** True while this message is still being streamed in. */
  streaming?: boolean
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
