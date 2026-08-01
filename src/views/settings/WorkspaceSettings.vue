<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import SettingsButton from '@/components/ui/SettingsButton.vue'
import useUiStore from '@/stores/ui'
import useWorkspaceStore from '@/stores/workspace'
import { useMediaPlaceholder, useStorageUpload } from '@/composables'
import { isVideoFile } from '@/utils/media'
import { WORKSPACE_PAGES } from '@/types/workspace'
import type { WorkspacePageKey } from '@/types/workspace'

const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()

const { uploadToStorage } = useStorageUpload()
const { generatePlaceholder } = useMediaPlaceholder()

const pageLabels: Record<WorkspacePageKey, string> = {
  dashboard: 'Dashboard',
  day: 'Day',
  month: 'Month',
  search: 'Search',
  settings: 'Settings',
}

type ByPage<T> = Partial<Record<WorkspacePageKey, T>>

const fileInputs = ref<ByPage<HTMLInputElement | null>>({})
const selectedFiles = ref<ByPage<File | null>>({})
const previewUrls = ref<ByPage<string>>({})
const previewIsVideo = ref<ByPage<boolean>>({})
const previewVideos = ref<ByPage<HTMLVideoElement | null>>({})

const isSaving = computed(() => workspaceStore.isLoading)

const handleFileSelected = (page: WorkspacePageKey, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  selectedFiles.value[page] = file

  if (previewUrls.value[page]) {
    URL.revokeObjectURL(previewUrls.value[page]!)
    delete previewUrls.value[page]
  }

  if (!file) {
    previewIsVideo.value[page] = false
    return
  }

  previewUrls.value[page] = URL.createObjectURL(file)
  previewIsVideo.value[page] = isVideoFile(file)

  input.value = ''
}

const clearSelection = (page: WorkspacePageKey) => {
  delete selectedFiles.value[page]
  if (previewUrls.value[page]) {
    URL.revokeObjectURL(previewUrls.value[page]!)
    delete previewUrls.value[page]
  }
  previewIsVideo.value[page] = false
  const input = fileInputs.value[page]
  if (input) input.value = ''
}

const uploadPageBackground = async (page: WorkspacePageKey) => {
  const file = selectedFiles.value[page]
  if (!file) {
    uiStore.showToast('Choose a file first', 'error')
    return
  }

  try {
    const [key, placeholder] = await Promise.all([
      uploadToStorage({ file, intent: 'workspace_asset', workspacePageKey: page }),
      generatePlaceholder(file),
    ])
    await workspaceStore.setBackground(page, { key, placeholder })
    clearSelection(page)
    uiStore.showToast(`${pageLabels[page]} background saved`, 'success')
  } catch (e: unknown) {
    const maybeErr = e as { message?: string }
    uiStore.showToast(maybeErr?.message || 'Failed to upload background', 'error')
  }
}

const openFilePicker = (page: WorkspacePageKey) => {
  const input = fileInputs.value[page]
  if (input) input.value = ''
  input?.click()
}

const clearPageBackground = async (page: WorkspacePageKey) => {
  await workspaceStore.clearBackground(page)
  uiStore.showToast(`${pageLabels[page]} background cleared`, 'success')
}

// Thumbnails hold their first frame until hovered, so opening this page doesn't
// start downloading and decoding every video background at once.
const playPreview = (page: WorkspacePageKey) => {
  previewVideos.value[page]?.play().catch(() => {})
}

const pausePreview = (page: WorkspacePageKey) => {
  const video = previewVideos.value[page]
  if (!video) return
  video.pause()
  video.currentTime = 0
}

const shownUrl = (page: WorkspacePageKey) =>
  previewUrls.value[page] || workspaceStore.backgrounds[page].url || ''

const shownIsVideo = (page: WorkspacePageKey) =>
  Boolean(
    previewUrls.value[page]
      ? previewIsVideo.value[page]
      : workspaceStore.backgrounds[page].isVideo,
  )

onMounted(async () => {
  await workspaceStore.fetchMyWorkspace()
})

onBeforeUnmount(() => {
  for (const url of Object.values(previewUrls.value)) {
    if (url) URL.revokeObjectURL(url)
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="text-xl font-semibold">Workspace</p>
      <p class="text-sm opacity-80">Set page background images/videos for this workspace.</p>
    </div>

    <section class="flex items-center justify-between gap-4">
      <div class="text-sm opacity-80" v-if="isSaving">Saving…</div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="page in WORKSPACE_PAGES"
        :key="page"
        class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <p class="font-semibold">{{ pageLabels[page] }}</p>
          <div class="flex items-center gap-2">
            <SettingsButton
              preset="pill"
              tone="danger"
              label="Clear"
              icon="trash"
              :disabled="workspaceStore.isDefault(page)"
              @click="clearPageBackground(page)"
            />
          </div>
        </div>

        <div class="text-xs opacity-70 min-h-[16px]">
          <span v-if="workspaceStore.isDefault(page)">Default background is in use.</span>
        </div>

        <div
          class="group w-full rounded-xl overflow-hidden bg-black/20 border border-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          role="button"
          tabindex="0"
          @click="openFilePicker(page)"
          @keydown.enter.prevent="openFilePicker(page)"
          @keydown.space.prevent="openFilePicker(page)"
          @mouseenter="playPreview(page)"
          @mouseleave="pausePreview(page)"
          @focusin="playPreview(page)"
          @focusout="pausePreview(page)"
        >
          <video
            v-if="shownUrl(page) && shownIsVideo(page)"
            :ref="(el) => (previewVideos[page] = el as HTMLVideoElement)"
            class="w-full h-[160px] object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            :src="shownUrl(page)"
            muted
            loop
            playsinline
            preload="metadata"
          />
          <img
            v-else-if="shownUrl(page)"
            class="w-full h-[160px] object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            :src="shownUrl(page)"
            alt="background preview"
          />
          <div v-else class="w-full h-[160px] flex items-center justify-center text-sm opacity-70">
            Click to choose background
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            class="hidden"
            :ref="(el) => (fileInputs[page] = el as HTMLInputElement)"
            @change="(e) => handleFileSelected(page, e)"
          />

          <div class="flex items-center gap-2">
            <SettingsButton
              preset="compact"
              label="Save"
              icon="upload"
              :disabled="!selectedFiles[page]"
              @click="uploadPageBackground(page)"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
