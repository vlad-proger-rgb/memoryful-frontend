import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { aiApi, chatModelsApi } from '@/api'
import { useApiError } from '@/composables'
import { useUiStore } from '@/stores/ui'
import type { ChatDetail, ChatListItem, ChatMessage, ChatModelOption } from '@/types/chat'

const MODEL_STORAGE_KEY = 'ai:selectedModelId'
const PENDING_CHAT_ID = 'pending'

export const useAiChatStore = defineStore('aiChat', () => {
  const { handleApiError, withLoading } = useApiError()
  const uiStore = useUiStore()

  const isOpen = ref(false)
  const isSidebarOpen = ref(true)

  const chatModels = ref<ChatModelOption[]>([])
  const selectedModelId = ref<string>(localStorage.getItem(MODEL_STORAGE_KEY) || '')

  const chats = ref<ChatListItem[]>([])
  const isLoadingChats = ref(false)
  const searchQuery = ref('')

  const currentChat = ref<ChatDetail | null>(null)
  const isLoadingChat = ref(false)
  const isSending = ref(false)

  const selectedModel = computed(
    () => chatModels.value.find((m) => m.id === selectedModelId.value) || chatModels.value[0] || null,
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
    if (currentChat.value?.id === id) return
    isLoadingChat.value = true
    try {
      const res = await aiApi.getChat(id)
      if (res.code === 200 && res.data) {
        currentChat.value = res.data
      }
    } catch (e) {
      handleApiError(e)
      uiStore.showToast('Could not load that chat', 'error')
    } finally {
      isLoadingChat.value = false
    }
  }

  function startNewChat() {
    currentChat.value = null
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || isSending.value) return false
    isSending.value = true

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
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

    try {
      const res = await aiApi.createCompletion({
        chatId: isNewChat ? null : currentChat.value!.id,
        modelId: isNewChat ? selectedModelId.value || null : null,
        content: trimmed,
      })

      if (res.code === 200 && res.data && currentChat.value) {
        currentChat.value.id = res.data.chatId
        currentChat.value.title = res.data.title
        currentChat.value.messages.push(res.data.message)

        if (isNewChat) {
          await fetchChats()
        }
      }
      return true
    } catch (e) {
      handleApiError(e)
      uiStore.showToast('Failed to get a response from MemoryfulAI', 'error')
      // roll back the optimistic user message so it can be retried
      currentChat.value?.messages.pop()
      if (isNewChat) currentChat.value = null
      return false
    } finally {
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
