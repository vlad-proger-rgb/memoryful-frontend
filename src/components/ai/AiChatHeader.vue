<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useAiChatStore } from '@/stores/aiChat'
import AiModelSelector from './AiModelSelector.vue'

defineProps<{
  fullPage?: boolean
}>()

const store = useAiChatStore()
const router = useRouter()

const menuOpen = ref(false)
const pendingDelete = ref(false)

const currentTitle = computed(() => store.currentChat?.title || '')

const closeMenu = () => {
  menuOpen.value = false
  pendingDelete.value = false
}

const openDedicatedPage = () => {
  store.close()
  router.push('/ai')
}

const openFullPageFromMenu = () => {
  closeMenu()
  openDedicatedPage()
}

const renameCurrent = () => {
  const id = store.currentChat?.id
  if (!id) return
  closeMenu()
  store.requestRename(id)
}

const deleteCurrent = () => {
  const id = store.currentChat?.id
  if (!id) return
  if (!pendingDelete.value) {
    pendingDelete.value = true
    window.setTimeout(() => {
      pendingDelete.value = false
    }, 2500)
    return
  }
  store.deleteChat(id)
  closeMenu()
}
</script>

<template>
  <!-- Wraps rather than splitting into two markup rows: below `md` the selector takes a
       full line of its own, at `md`+ it drops back inline between the title and the
       actions. One instance either way, so its open state survives a resize. -->
  <div
    class="flex flex-wrap items-center gap-x-1 gap-y-2 md:gap-2 px-2 md:px-4 py-2 md:py-3 border-b border-white/5 shrink-0 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] md:pt-3"
  >
    <button
      type="button"
      class="size-11 md:size-8 shrink-0 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Toggle chat history"
      title="Toggle chat history"
      @click="store.toggleSidebar()"
    >
      <font-awesome-icon icon="bars" />
    </button>

    <p class="shrink-0 text-base md:text-lg font-semibold text-white tracking-wide">MemoryfulAI</p>

    <AiModelSelector class="order-last w-full md:order-none md:w-auto md:min-w-0 md:flex-1" />

    <div class="ml-auto md:ml-0 shrink-0 flex items-center gap-1 md:gap-2">
      <!-- The mobile sheet already fills the screen, so "open full page" only means
           something on the desktop dropdown -->
      <button
        v-if="!fullPage"
        type="button"
        class="hidden md:flex size-8 rounded-lg items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Open full page"
        title="Open full page"
        @click="openDedicatedPage"
      >
        <font-awesome-icon icon="up-right-from-square" />
      </button>

      <!-- The sheet exists because touch has no hover. A mouse already reaches rename and
           delete on the sidebar row, so this would only open a bottom sheet on a desktop. -->
      <button
        type="button"
        class="md:hidden size-11 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Chat options"
        aria-haspopup="menu"
        :aria-expanded="menuOpen"
        title="Chat options"
        @click="menuOpen = true"
      >
        <font-awesome-icon icon="ellipsis-vertical" />
      </button>

      <!-- The open sidebar carries its own "New chat", so this is the quick action for
           when the list isn't on screen. -->
      <button
        type="button"
        class="size-11 md:size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        :class="{ 'md:hidden': store.isSidebarOpen }"
        aria-label="New chat"
        title="New chat"
        @click="store.startNewChat()"
      >
        <font-awesome-icon icon="pen-to-square" />
      </button>

      <button
        v-if="!fullPage"
        type="button"
        class="size-11 md:size-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close"
        title="Close"
        @click="store.close()"
      >
        <font-awesome-icon icon="xmark" />
      </button>
    </div>
  </div>

  <BottomSheet
    :show="menuOpen"
    :label="currentTitle ? `Options for ${currentTitle}` : 'Chat options'"
    :title="currentTitle"
    @update:show="closeMenu"
  >
    <button
      type="button"
      role="menuitem"
      class="flex w-full items-center gap-3 px-4 py-3.5 text-left text-white active:bg-white/10 disabled:opacity-40"
      :disabled="!store.currentChat"
      @click="renameCurrent"
    >
      <font-awesome-icon icon="pen" class="w-4 text-white/60" />
      Rename
    </button>
    <button
      v-if="!fullPage"
      type="button"
      role="menuitem"
      class="flex w-full items-center gap-3 px-4 py-3.5 text-left text-white active:bg-white/10"
      @click="openFullPageFromMenu"
    >
      <font-awesome-icon icon="up-right-from-square" class="w-4 text-white/60" />
      Open full page
    </button>
    <button
      type="button"
      role="menuitem"
      class="flex w-full items-center gap-3 px-4 py-3.5 text-left text-rose-300 active:bg-rose-500/10 disabled:opacity-40"
      :disabled="!store.currentChat"
      @click="deleteCurrent"
    >
      <font-awesome-icon :icon="pendingDelete ? 'check' : 'trash'" class="w-4" />
      {{ pendingDelete ? 'Tap again to confirm' : 'Delete' }}
    </button>
  </BottomSheet>
</template>
