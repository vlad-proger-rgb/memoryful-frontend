<script setup lang="ts">
import useWorkspaceStore from '@/stores/workspace'
import MediaBackground from '@/components/ui/MediaBackground.vue'
import { useResolvedStorageMedia } from '@/composables/useResolvedStorageMedia'

const workspaceStore = useWorkspaceStore()

const { url: backgroundUrl, isVideo: isBackgroundVideo } = useResolvedStorageMedia(
  () => workspaceStore.settings.dashboardBackground,
)
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden">
    <MediaBackground
      :src="backgroundUrl"
      :is-video="isBackgroundVideo"
      class-name="fixed inset-0 w-full h-full object-cover z-0 brightness-75"
      fallback-class-name="fixed inset-0 w-full h-full z-0 bg-black"
    />

    <div class="relative z-10 pt-24 px-4 max-w-3xl mx-auto text-white">
      <h1 class="text-2xl font-bold">DashboardView</h1>
    </div>
  </div>
</template>
