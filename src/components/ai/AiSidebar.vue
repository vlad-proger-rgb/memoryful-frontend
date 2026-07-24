<script setup lang="ts">
import { ref } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import type { ChatListItem } from '@/types/chat'

const store = useAiChatStore()
const isSearching = ref(false)
const pendingDeleteId = ref<string | null>(null)

const startNewChat = () => {
  store.startNewChat()
}

const toggleSearch = () => {
  isSearching.value = !isSearching.value
  if (!isSearching.value) store.searchQuery = ''
}

const requestDelete = (chat: ChatListItem, event: MouseEvent) => {
  event.stopPropagation()
  if (pendingDeleteId.value === chat.id) {
    store.deleteChat(chat.id)
    pendingDeleteId.value = null
  } else {
    pendingDeleteId.value = chat.id
    window.setTimeout(() => {
      if (pendingDeleteId.value === chat.id) pendingDeleteId.value = null
    }, 2500)
  }
}
</script>

<template>
  <div class="w-[220px] shrink-0 flex flex-col bg-black/30 border-r border-white/5 h-full">
    <div class="flex items-center justify-between gap-1 px-3 py-3 shrink-0">
      <p class="text-xs font-semibold text-white/50 uppercase tracking-wide">Chats</p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="size-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="New chat"
          @click="startNewChat"
        >
          <font-awesome-icon icon="pen-to-square" class="text-sm" />
        </button>
        <button
          type="button"
          class="size-7 rounded-lg flex items-center justify-center transition-colors"
          :class="isSearching ? 'text-white bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'"
          title="Search chats"
          @click="toggleSearch"
        >
          <font-awesome-icon icon="magnifying-glass" class="text-sm" />
        </button>
      </div>
    </div>

    <div v-if="isSearching" class="px-3 pb-2 shrink-0">
      <input
        v-model="store.searchQuery"
        type="text"
        autofocus
        placeholder="Search chats..."
        class="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/25"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto px-2 pb-2 flex flex-col gap-1 ai-sidebar-scroll">
      <div v-if="store.isLoadingChats" class="text-center text-xs text-white/40 py-4">Loading...</div>

      <div v-else-if="!store.filteredChats.length" class="text-center text-xs text-white/40 py-4 px-2">
        {{ store.searchQuery ? 'No chats match your search' : 'No chats yet — say hi!' }}
      </div>

      <button
        v-for="chat in store.filteredChats"
        :key="chat.id"
        type="button"
        class="group flex items-center justify-between gap-1 w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
        :class="
          store.currentChat?.id === chat.id
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        "
        @click="store.openChat(chat.id)"
      >
        <span class="truncate">{{ chat.title }}</span>
        <span
          class="shrink-0 size-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          :class="pendingDeleteId === chat.id ? 'bg-rose-500/30 opacity-100' : 'hover:bg-white/15'"
          @click="requestDelete(chat, $event)"
        >
          <font-awesome-icon
            :icon="pendingDeleteId === chat.id ? 'check' : 'trash'"
            class="text-[10px]"
            :class="pendingDeleteId === chat.id ? 'text-rose-200' : 'text-white/60'"
          />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.ai-sidebar-scroll::-webkit-scrollbar {
  width: 5px;
}

.ai-sidebar-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
</style>
