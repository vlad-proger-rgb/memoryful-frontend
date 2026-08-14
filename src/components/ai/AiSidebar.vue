<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import type { ChatListItem } from '@/types/chat'

const store = useAiChatStore()
const isSearching = ref(false)
const pendingDeleteId = ref<string | null>(null)

const editingId = ref<string | null>(null)
const draftTitle = ref('')
// A plain `ref="..."` inside v-for resolves to an array, so focus() would
// silently no-op — and without focus the input never blurs, leaving the edit
// box stranded when you click away. A function ref binds the element directly.
const renameInput = ref<HTMLInputElement | null>(null)
const setRenameInput = (el: unknown) => {
  renameInput.value = (el as HTMLInputElement) ?? null
}

watch(editingId, async (id) => {
  if (!id) return
  await nextTick()
  renameInput.value?.focus()
  renameInput.value?.select()
})

// Belt and braces: if the open chat changes while a row is being renamed
// (blur normally commits first), never leave the edit box stranded.
watch(
  () => store.currentChat?.id,
  () => {
    if (editingId.value) cancelRename()
  },
)

const startNewChat = () => {
  store.startNewChat()
}

const toggleSearch = () => {
  isSearching.value = !isSearching.value
  if (!isSearching.value) store.searchQuery = ''
}

const startRename = (chat: ChatListItem, event: MouseEvent) => {
  event.stopPropagation()
  pendingDeleteId.value = null
  draftTitle.value = chat.title
  editingId.value = chat.id
}

const cancelRename = () => {
  editingId.value = null
  draftTitle.value = ''
}

const commitRename = (chat: ChatListItem) => {
  if (editingId.value !== chat.id) return
  const title = draftTitle.value.trim()
  editingId.value = null
  // Nothing to do for an empty or unchanged title.
  if (!title || title === chat.title) return
  store.renameChat(chat.id, title)
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
  <div
    class="absolute inset-y-0 left-0 z-20 w-[78%] max-w-[280px] bg-[#0d0d12]/95 backdrop-blur-xl md:static md:z-auto md:w-[220px] md:max-w-none md:bg-black/30 md:backdrop-blur-none shrink-0 flex flex-col border-r border-white/5 h-full"
  >
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
          :class="
            isSearching
              ? 'text-white bg-white/15'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          "
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
      <div v-if="store.isLoadingChats" class="text-center text-xs text-white/40 py-4">
        Loading...
      </div>

      <div
        v-else-if="!store.filteredChats.length"
        class="text-center text-xs text-white/40 py-4 px-2"
      >
        {{ store.searchQuery ? 'No chats match your search' : 'No chats yet — say hi!' }}
      </div>

      <template v-for="chat in store.filteredChats" :key="chat.id">
        <!-- Edit mode is its own row: an <input> inside the row <button> would
             swallow clicks and is invalid nesting. -->
        <div v-if="editingId === chat.id" class="px-2 py-1 rounded-xl bg-white/15">
          <input
            :ref="setRenameInput"
            v-model="draftTitle"
            type="text"
            maxlength="60"
            class="w-full bg-transparent text-sm text-white outline-none"
            @keydown.enter.prevent="commitRename(chat)"
            @keydown.esc.prevent="cancelRename"
            @blur="commitRename(chat)"
          />
        </div>

        <button
          v-else
          type="button"
          class="group flex items-center justify-between gap-1 w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
          :class="
            store.currentChat?.id === chat.id
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          "
          @click="store.openChat(chat.id)"
        >
          <span class="truncate" @dblclick.stop="startRename(chat, $event)">{{ chat.title }}</span>
          <span class="shrink-0 flex items-center gap-0.5">
            <span
              class="size-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/15"
              title="Rename"
              @click="startRename(chat, $event)"
            >
              <font-awesome-icon icon="pen" class="text-[10px] text-white/60" />
            </span>
            <span
              class="size-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              :class="
                pendingDeleteId === chat.id ? 'bg-rose-500/30 opacity-100' : 'hover:bg-white/15'
              "
              :title="pendingDeleteId === chat.id ? 'Click again to confirm' : 'Delete'"
              @click="requestDelete(chat, $event)"
            >
              <font-awesome-icon
                :icon="pendingDeleteId === chat.id ? 'check' : 'trash'"
                class="text-[10px]"
                :class="pendingDeleteId === chat.id ? 'text-rose-200' : 'text-white/60'"
              />
            </span>
          </span>
        </button>
      </template>
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
