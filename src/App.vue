<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import AppToast from '@/components/ui/AppToast.vue'
import useUiStore from '@/stores/ui.ts'
import { useUserStore } from '@/stores/user'
import useWorkspaceStore from '@/stores/workspace'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const uiStore = useUiStore()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()

const showAppShell = computed(() => route.meta.appShell !== false)

onMounted(() => {
  userStore.initializeFromStorage().then(() => {
    if (userStore.isAuthenticated) {
      workspaceStore.fetchMyWorkspace()
    }
  })
})

watch(
  () => userStore.isAuthenticated,
  (next) => {
    if (next) {
      workspaceStore.fetchMyWorkspace()
    }
  },
)
</script>

<template>
  <div class="h-screen" :class="{ 'overflow-hidden': uiStore.disableScroll }">
    <Navbar v-if="showAppShell" class="fixed top-0 left-0 w-full z-50" />
    <AppToast />
    <div :class="showAppShell ? 'pt-[60px]' : ''">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
