import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { aiApi, chatModelsApi } from '@/api'
import { useApiError } from '@/composables'
import { useUiStore } from '@/stores/ui'
import type { ChatDetail, ChatListItem, ChatMessage, ChatModelOption } from '@/types/chat'

const MODEL_STORAGE_KEY = 'ai:selectedModelId'
const PENDING_CHAT_ID = 'pending'

// Below md the chat list overlays the conversation instead of docking beside it, so it
// starts closed and dismisses itself once a chat is picked. Presentation stays in CSS;
// this is the one thing that genuinely differs in behavior
const isSidebarDocked = () => window.matchMedia('(min-width: 768px)').matches

export const useAiChatStore = defineStore('aiChat', () => {
  const { handleApiError, withLoading } = useApiError()
  const uiStore = useUiStore()

  const isOpen = ref(false)
  const isSidebarOpen = ref(isSidebarDocked())

  const chatModels = ref<ChatModelOption[]>([])
  const selectedModelId = ref<string>(localStorage.getItem(MODEL_STORAGE_KEY) || '')

  const chats = ref<ChatListItem[]>([])
  const isLoadingChats = ref(false)
  const searchQuery = ref('')

  const currentChat = ref<ChatDetail | null>(null)
  const isLoadingChat = ref(false)
  const isSending = ref(false)
  // Last send failure, shown inline in the message list. A toast alone is easy
  // to miss, and a failed completion otherwise looks like nothing happened.
  const sendError = ref<string>('')

  const selectedModel = computed(
    () =>
      chatModels.value.find((m) => m.id === selectedModelId.value) || chatModels.value[0] || null,
  )

  const filteredChats = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return chats.value
    return chats.value.filter((c) => c.title.toLowerCase().includes(q))
  })

  const isPendingChat = computed(() => currentChat.value?.id === PENDING_CHAT_ID)

  function selectModel(modelId: string) {
    selectedModelId.value = modelId
    localStorage.setItem(MODEL_STORAGE_KEY, modelId)
  }

  /** The model new chats start with — the user's last explicit pick. */
  function preferredModelId(): string {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY) || ''
    if (stored && chatModels.value.some((m) => m.id === stored)) return stored
    return chatModels.value[0]?.id || ''
  }

  /** Extract the API's message so the user sees why it failed, not a generic line. */
  function extractErrorMessage(e: unknown): string {
    const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) return detail
    return 'Failed to get a response from MemoryfulAI. Please try again.'
  }

  async function fetchChatModels() {
    try {
      const res = await chatModelsApi.getChatModels()
      if (res.code === 200 && res.data) {
        chatModels.value = res.data
        if (!selectedModelId.value || !res.data.some((m) => m.id === selectedModelId.value)) {
          selectModel(res.data[0]?.id || '')
        }
      }
    } catch (e) {
      handleApiError(e)
    }
  }

  async function fetchChats() {
    isLoadingChats.value = true
    await withLoading(async () => {
      const res = await aiApi.getChats()
      if (res.code === 200 && res.data) {
        chats.value = res.data
        return true
      }
      return false
    })
    isLoadingChats.value = false
  }

  async function openChat(id: string) {
    if (!isSidebarDocked()) isSidebarOpen.value = false
    if (currentChat.value?.id === id) return
    isLoadingChat.value = true
    sendError.value = ''
    try {
      const res = await aiApi.getChat(id)
      if (res.code === 200 && res.data) {
        currentChat.value = res.data
        // Show the model this chat actually uses. The backend always answers an
        // existing chat with the model it was created with and ignores whatever
        // is selected, so the picker must follow the chat, not the other way
        // round. Deliberately not persisted — that stays the new-chat default.
        const chatModelId = res.data.chatModel?.id || res.data.modelId
        if (chatModelId) selectedModelId.value = chatModelId
      }
    } catch (e) {
      handleApiError(e)
      uiStore.showToast('Could not load that chat', 'error')
    } finally {
      isLoadingChat.value = false
    }
  }

  function startNewChat() {
    if (!isSidebarDocked()) isSidebarOpen.value = false
    currentChat.value = null
    sendError.value = ''
    // Back to the user's own default, rather than inheriting the model of
    // whichever chat happened to be open.
    selectedModelId.value = preferredModelId()
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || isSending.value) return false
    isSending.value = true
    sendError.value = ''

    // Timestamped locally so it renders immediately; the server's value replaces
    // it when the stream starts.
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    const isNewChat = !currentChat.value

    if (currentChat.value) {
      currentChat.value.messages.push(userMessage)
    } else {
      currentChat.value = {
        id: PENDING_CHAT_ID,
        title: 'New chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: '',
        modelId: selectedModelId.value,
        chatModel: selectedModel.value ?? { id: '', label: 'Auto', name: 'auto' },
        messages: [userMessage],
      }
    }

    // Read both back out of the array so we mutate Vue's reactive proxies rather
    // than the raw objects we pushed.
    const sent = currentChat.value!.messages[currentChat.value!.messages.length - 1]
    currentChat.value!.messages.push({ role: 'assistant', content: '', tools: [], streaming: true })
    const reply = currentChat.value!.messages[currentChat.value!.messages.length - 1]

    let streamError = ''

    try {
      await aiApi.streamCompletion(
        {
          chatId: isNewChat ? null : currentChat.value!.id,
          modelId: isNewChat ? selectedModelId.value || null : null,
          content: trimmed,
        },
        {
          onStart: ({ chatId, title, createdAt }) => {
            if (!currentChat.value) return
            currentChat.value.id = chatId
            currentChat.value.title = title
            if (createdAt) sent.createdAt = createdAt
          },
          onToken: (text) => {
            reply.content += text
          },
          onToolCall: ({ name, args }) => {
            reply.tools?.push({ name, args, status: 'running' })
          },
          onToolResult: ({ name }) => {
            // Close the most recent still-running call of that tool.
            const running = [...(reply.tools ?? [])]
              .reverse()
              .find((t) => t.name === name && t.status === 'running')
            if (running) running.status = 'done'
          },
          onDone: ({ chatId, title, content, createdAt }) => {
            if (!currentChat.value) return
            currentChat.value.id = chatId
            currentChat.value.title = title
            // Trust the persisted text so a reload shows exactly this.
            if (content) reply.content = content
            if (createdAt) reply.createdAt = createdAt
          },
          onError: (message) => {
            streamError = message
          },
        },
      )

      if (streamError) {
        sendError.value = streamError
        uiStore.showToast(streamError, 'error')
      }

      // Nothing came back at all — treat it as a failure rather than leaving an
      // empty bubble sitting in the chat.
      if (!reply.content && !reply.tools?.length) {
        if (!streamError) {
          sendError.value = 'MemoryfulAI returned an empty response. Please try again.'
          uiStore.showToast(sendError.value, 'error')
        }
        currentChat.value?.messages.pop()
        currentChat.value?.messages.pop()
        if (isNewChat) currentChat.value = null
        return false
      }

      if (isNewChat) {
        // Refresh the sidebar in the background: awaiting it here kept the
        // typing indicator on screen for a second after the reply rendered.
        void fetchChats()
      }
      return !streamError
    } catch (e) {
      handleApiError(e)
      sendError.value = extractErrorMessage(e)
      uiStore.showToast(sendError.value, 'error')
      // roll back the placeholder and the optimistic user message so it can be retried
      currentChat.value?.messages.pop()
      currentChat.value?.messages.pop()
      // A failed first message never became a real chat, so drop back to the
      // welcome view; the error banner explains why.
      if (isNewChat) currentChat.value = null
      return false
    } finally {
      reply.streaming = false
      isSending.value = false
    }
  }

  async function renameChat(id: string, title: string) {
    try {
      await aiApi.renameChat(id, title)
      const item = chats.value.find((c) => c.id === id)
      if (item) item.title = title
      if (currentChat.value?.id === id) currentChat.value.title = title
    } catch (e) {
      handleApiError(e)
      uiStore.showToast('Failed to rename chat', 'error')
    }
  }

  async function deleteChat(id: string) {
    try {
      await aiApi.deleteChat(id)
      chats.value = chats.value.filter((c) => c.id !== id)
      if (currentChat.value?.id === id) currentChat.value = null
    } catch (e) {
      handleApiError(e)
      uiStore.showToast('Failed to delete chat', 'error')
    }
  }

  function open() {
    isOpen.value = true
    if (!chatModels.value.length) fetchChatModels()
    if (!chats.value.length) fetchChats()
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    if (isOpen.value) close()
    else open()
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  return {
    isOpen,
    isSidebarOpen,
    chatModels,
    selectedModelId,
    selectedModel,
    chats,
    filteredChats,
    isLoadingChats,
    searchQuery,
    currentChat,
    isLoadingChat,
    isSending,
    sendError,
    isPendingChat,
    selectModel,
    fetchChatModels,
    fetchChats,
    openChat,
    startNewChat,
    sendMessage,
    renameChat,
    deleteChat,
    open,
    close,
    toggle,
    toggleSidebar,
  }
})

export default useAiChatStore
