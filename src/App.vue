<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import DemoNavbar from '@/components/demo/DemoNavbar.vue'
import DemoBottomNav from '@/components/demo/DemoBottomNav.vue'
import BottomNav from '@/components/BottomNav.vue'
import AppToast from '@/components/ui/AppToast.vue'
import AiChatPanel from '@/components/ai/AiChatPanel.vue'
import useFeatureFlagsStore from '@/stores/featureFlags'
import useUiStore from '@/stores/ui.ts'
import { useUserStore } from '@/stores/user'
import useWorkspaceStore from '@/stores/workspace'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const uiStore = useUiStore()
const featureFlags = useFeatureFlagsStore()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()

const showAppShell = computed(() => route.meta.appShell !== false)
const usesDemoHeader = computed(() => featureFlags.demoUi || route.meta.header === 'demo')

watch(
  () => userStore.isAuthenticated,
  (next) => {
    if (next) {
      workspaceStore.fetchMyWorkspace()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-dvh md:h-screen" :class="{ 'md:overflow-hidden': uiStore.disableScroll }">
    <DemoNavbar
      v-if="showAppShell && usesDemoHeader"
      class="fixed top-0 left-0 w-full z-50 hidden md:flex"
    />
    <Navbar v-else-if="showAppShell" class="fixed top-0 left-0 w-full z-50 hidden md:flex" />
    <DemoBottomNav v-if="showAppShell && usesDemoHeader" class="md:hidden" />
    <BottomNav v-else-if="showAppShell" class="md:hidden" />
    <AiChatPanel v-if="showAppShell" />
    <AppToast />
    <div
      :class="
        showAppShell ? 'pb-[var(--bottom-nav-total)] md:pb-0 md:pt-[var(--app-header-height)]' : ''
      "
    >
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
