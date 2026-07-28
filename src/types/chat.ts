export interface ChatModelOption {
  id: string
  label: string
  name: string
  provider: string
  supportsTools: boolean
}

export type ChatRole = 'system' | 'user' | 'assistant'

/** A tool the assistant ran while answering. Persisted with the message, so it
 *  still shows when the chat is reloaded — stored tools have no `status`
 *  (they're finished by definition). */
export interface ToolActivity {
  name: string
  args?: Record<string, unknown>
  status?: 'running' | 'done'
}

/** Something the user @-referenced in a message. */
export interface ChatAttachment {
  type: 'day'
  timestamp: number
  label?: string
}

export interface ChatMessage {
  role: ChatRole
  content: string
  tools?: ToolActivity[]
  attachments?: ChatAttachment[]
  createdAt?: string | null
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
