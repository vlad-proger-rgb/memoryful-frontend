import axios, { refreshAccessToken } from '@/api/client'
import type { ApiResponse } from '@/types'
import type { ChatAttachment, ChatListItem, ChatDetail, CompletionResult } from '@/types/chat'

export interface CompletionPayload {
  chatId?: string | null
  modelId?: string | null
  content: string
  attachments?: ChatAttachment[]
}

export interface StreamHandlers {
  onStart?: (e: { chatId: string; title: string; createdAt?: string }) => void
  onToken?: (text: string) => void
  onToolCall?: (e: { name: string; args: Record<string, unknown> }) => void
  onToolResult?: (e: { name: string }) => void
  onDone?: (e: { chatId: string; title: string; content: string; createdAt?: string }) => void
  onError?: (message: string) => void
}

const STREAM_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/ai/completions/stream`

/** EventSource can't send an Authorization header, so the stream is a POST via
 *  fetch and we parse the SSE frames ourselves. */
function postStream(payload: CompletionPayload, token: string, signal?: AbortSignal) {
  return fetch(STREAM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
    signal,
  })
}

function dispatch(event: Record<string, unknown>, handlers: StreamHandlers) {
  switch (event.type) {
    case 'start':
      handlers.onStart?.({
        chatId: String(event.chatId),
        title: String(event.title),
        createdAt: event.createdAt ? String(event.createdAt) : undefined,
      })
      break
    case 'token':
      handlers.onToken?.(String(event.text ?? ''))
      break
    case 'toolCall':
      handlers.onToolCall?.({
        name: String(event.name ?? ''),
        args: (event.args as Record<string, unknown>) || {},
      })
      break
    case 'toolResult':
      handlers.onToolResult?.({ name: String(event.name ?? '') })
      break
    case 'done':
      handlers.onDone?.({
        chatId: String(event.chatId),
        title: String(event.title),
        content: String(event.content ?? ''),
        createdAt: event.createdAt ? String(event.createdAt) : undefined,
      })
      break
    case 'error':
      handlers.onError?.(String(event.message ?? 'Something went wrong'))
      break
  }
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

  /** Stream a completion, invoking `handlers` as events arrive. Resolves when the
   *  stream ends; throws only on transport failures (server-side problems arrive
   *  as an `error` event). */
  async streamCompletion(
    payload: CompletionPayload,
    handlers: StreamHandlers,
    signal?: AbortSignal,
  ): Promise<void> {
    let token = sessionStorage.getItem('accessToken') || ''
    let response = await postStream(payload, token, signal)

    // The axios interceptor can't help here; refresh once and retry by hand.
    if (response.status === 401) {
      token = await refreshAccessToken()
      response = await postStream(payload, token, signal)
    }

    if (!response.ok || !response.body) {
      throw new Error(`Stream failed with status ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      // SSE frames are separated by a blank line; keep any partial tail.
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        const line = frame.split('\n').find((l) => l.startsWith('data:'))
        if (!line) continue
        try {
          dispatch(JSON.parse(line.slice(5).trim()), handlers)
        } catch {
          // ignore malformed frame rather than killing the stream
        }
      }
    }
  },
}

export default aiApi
