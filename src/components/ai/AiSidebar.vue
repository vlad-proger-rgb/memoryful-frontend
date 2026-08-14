<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useAiChatStore } from '@/stores/aiChat'
import type { ChatListItem } from '@/types/chat'

const store = useAiChatStore()
const isSearching = ref(false)
const pendingDeleteId = ref<string | null>(null)

// Touch has no hover, so a long press stands in for the hover-revealed actions.
// Held by id, not by object, so a chat deleted from under it closes the sheet.
const menuChatId = ref<string | null>(null)
const menuChat = computed(() => store.filteredChats.find((c) => c.id === menuChatId.value) ?? null)

const LONG_PRESS_MS = 450
// Past this the finger is scrolling the list, not holding a row.
const LONG_PRESS_SLOP_PX = 10

let pressTimer: number | null = null
let pressOrigin: { x: number; y: number } | null = null
// Set when the press opened the sheet, so the click that follows doesn't also open the chat.
let pressOpenedSheet = false

const cancelPress = () => {
  if (pressTimer !== null) window.clearTimeout(pressTimer)
  pressTimer = null
  pressOrigin = null
}

const startPress = (chat: ChatListItem, event: PointerEvent) => {
  if (event.pointerType === 'mouse') return
  cancelPress()
  pressOpenedSheet = false
  pressOrigin = { x: event.clientX, y: event.clientY }
  pressTimer = window.setTimeout(() => {
    pressOpenedSheet = true
    pendingDeleteId.value = null
    menuChatId.value = chat.id
    navigator.vibrate?.(10)
  }, LONG_PRESS_MS)
}

const movePress = (event: PointerEvent) => {
  if (!pressOrigin) return
  const dx = Math.abs(event.clientX - pressOrigin.x)
  const dy = Math.abs(event.clientY - pressOrigin.y)
  if (dx > LONG_PRESS_SLOP_PX || dy > LONG_PRESS_SLOP_PX) cancelPress()
}

const openChat = (chat: ChatListItem) => {
  if (pressOpenedSheet) {
    pressOpenedSheet = false
    return
  }
  store.openChat(chat.id)
}

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
    closeMenu()
  } else {
    pendingDeleteId.value = chat.id
    window.setTimeout(() => {
      if (pendingDeleteId.value === chat.id) pendingDeleteId.value = null
    }, 2500)
  }
}

// The header's "Rename" acts on the current chat but the editor is a row here.
watch(
  () => store.renameRequest,
  (req) => {
    if (!req) return
    const chat = store.chats.find((c) => c.id === req.id)
    if (!chat) return
    pendingDeleteId.value = null
    draftTitle.value = chat.title
    editingId.value = chat.id
  },
  { deep: true },
)

function closeMenu() {
  menuChatId.value = null
  pendingDeleteId.value = null
}

const renameFromMenu = (chat: ChatListItem, event: MouseEvent) => {
  startRename(chat, event)
  closeMenu()
}

onBeforeUnmount(cancelPress)
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
          aria-label="New chat"
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
          aria-label="Search chats"
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
        <!-- Edit mode replaces the whole row: an <input> inside the title <button> would
             swallow clicks and is invalid nesting. -->
        <div v-if="editingId === chat.id" class="px-2 py-1 rounded-xl bg-white/15">
          <input
            :ref="setRenameInput"
            v-model="draftTitle"
            type="text"
            maxlength="60"
            class="w-full bg-transparent text-base md:text-sm text-white outline-none"
            @keydown.enter.prevent="commitRename(chat)"
            @keydown.esc.prevent="cancelRename"
            @blur="commitRename(chat)"
          />
        </div>

        <div
          v-else
          class="group flex items-center gap-0.5 rounded-xl text-sm transition-colors"
          :class="
            store.currentChat?.id === chat.id
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          "
        >
          <button
            type="button"
            class="flex-1 min-w-0 truncate text-left pl-3 py-2 touch:select-none"
            @click="openChat(chat)"
            @dblclick.stop="startRename(chat, $event)"
            @pointerdown="startPress(chat, $event)"
            @pointermove="movePress"
            @pointerup="cancelPress"
            @pointerleave="cancelPress"
            @pointercancel="cancelPress"
            @contextmenu.prevent
          >
            {{ chat.title }}
          </button>
          <span class="shrink-0 flex items-center gap-0.5 pr-3">
            <button
              type="button"
              class="size-5 touch:hidden rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-white/15"
              :aria-label="`Rename ${chat.title}`"
              title="Rename"
              @click="startRename(chat, $event)"
            >
              <font-awesome-icon icon="pen" class="text-[10px] text-white/60" />
            </button>
            <button
              type="button"
              class="size-5 touch:hidden rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              :class="
                pendingDeleteId === chat.id ? 'bg-rose-500/30 opacity-100' : 'hover:bg-white/15'
              "
              :aria-label="
                pendingDeleteId === chat.id
                  ? `Confirm deleting ${chat.title}`
                  : `Delete ${chat.title}`
              "
              :title="pendingDeleteId === chat.id ? 'Click again to confirm' : 'Delete'"
              @click="requestDelete(chat, $event)"
            >
              <font-awesome-icon
                :icon="pendingDeleteId === chat.id ? 'check' : 'trash'"
                class="text-[10px]"
                :class="pendingDeleteId === chat.id ? 'text-rose-200' : 'text-white/60'"
              />
            </button>
          </span>
        </div>
      </template>
    </div>

    <!-- Inside the root on purpose: a second root node would make this component a
         fragment, and the parent's <Transition> silently stops animating a fragment.
         The sheet teleports to body regardless of where it sits here. -->
    <BottomSheet
      :show="!!menuChat"
      :label="menuChat ? `Options for ${menuChat.title}` : undefined"
      :title="menuChat?.title"
      @update:show="closeMenu"
    >
      <template v-if="menuChat">
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 px-4 py-3.5 text-left text-white active:bg-white/10"
          @click="renameFromMenu(menuChat, $event)"
        >
          <font-awesome-icon icon="pen" class="w-4 text-white/60" />
          Rename
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 px-4 py-3.5 text-left text-rose-300 active:bg-rose-500/10"
          @click="requestDelete(menuChat, $event)"
        >
          <font-awesome-icon
            :icon="pendingDeleteId === menuChat.id ? 'check' : 'trash'"
            class="w-4"
          />
          {{ pendingDeleteId === menuChat.id ? 'Tap again to confirm' : 'Delete' }}
        </button>
      </template>
    </BottomSheet>
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
