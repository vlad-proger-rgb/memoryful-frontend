<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import SettingsButton from '@/components/ui/SettingsButton.vue'
import useUiStore from '@/stores/ui'
import useWorkspaceStore from '@/stores/workspace'
import { useStorageResolve, useStorageUpload } from '@/composables'

type PageKey = 'dashboard' | 'day' | 'search' | 'settings'

const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()

const { uploadToStorage } = useStorageUpload()
const { resolveStorageSrc } = useStorageResolve()

const computeIsVideo = (src: string) => {
  const lower = src.toLowerCase()
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.m4v') ||
    lower.endsWith('.avi')
  )
}

const selectedFiles = ref<Record<PageKey, File | null>>({
  dashboard: null,
  day: null,
  search: null,
  settings: null,
})

const previewUrls = ref<Record<PageKey, string | null>>({
  dashboard: null,
  day: null,
  search: null,
  settings: null,
})

const previewIsVideo = ref<Record<PageKey, boolean>>({
  dashboard: false,
  day: false,
  search: false,
  settings: false,
})

const resolvedUrls = ref<Record<PageKey, string | null>>({
  dashboard: null,
  day: null,
  search: null,
  settings: null,
})

const resolvedIsVideo = ref<Record<PageKey, boolean>>({
  dashboard: false,
  day: false,
  search: false,
  settings: false,
})

const pageLabels: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  day: 'Day',
  search: 'Search',
  settings: 'Settings',
}

const getKeyForPage = (page: PageKey) => {
  const s = workspaceStore.settings
  if (page === 'dashboard') return s.dashboardBackground
  if (page === 'day') return s.dayBackground
  if (page === 'search') return s.searchBackground
  return s.settingsBackground
}

const setKeyForPage = (page: PageKey, key: string | null) => {
  if (page === 'dashboard') workspaceStore.setSettings({ dashboardBackground: key })
  else if (page === 'day') workspaceStore.setSettings({ dayBackground: key })
  else if (page === 'search') workspaceStore.setSettings({ searchBackground: key })
  else workspaceStore.setSettings({ settingsBackground: key })
}

const patchForPage = (page: PageKey, key: string | null) => {
  if (page === 'dashboard') return { dashboardBackground: key }
  if (page === 'day') return { dayBackground: key }
  if (page === 'search') return { searchBackground: key }
  return { settingsBackground: key }
}

const refreshResolved = async (page: PageKey) => {
  const key = getKeyForPage(page)
  resolvedUrls.value[page] = await resolveStorageSrc(key)
  resolvedIsVideo.value[page] = !!key && computeIsVideo(key)
}

watch(
  () => ({ ...workspaceStore.settings }),
  async () => {
    await Promise.all([
      refreshResolved('dashboard'),
      refreshResolved('day'),
      refreshResolved('search'),
      refreshResolved('settings'),
    ])
  },
  { immediate: true },
)

const handleFileSelected = (page: PageKey, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  selectedFiles.value[page] = file

  if (previewUrls.value[page]) {
    URL.revokeObjectURL(previewUrls.value[page]!)
    previewUrls.value[page] = null
  }

  if (!file) {
    previewIsVideo.value[page] = false
    return
  }

  const url = URL.createObjectURL(file)
  previewUrls.value[page] = url
  previewIsVideo.value[page] = computeIsVideo(file.name)
}

const uploadPageBackground = async (page: PageKey) => {
  const file = selectedFiles.value[page]
  if (!file) return

  try {
    const objectKey = await uploadToStorage({
      file,
      intent: 'workspace_asset',
      workspacePageKey: page,
    })

    setKeyForPage(page, objectKey)
    await workspaceStore.updateMyWorkspace(patchForPage(page, objectKey))
    selectedFiles.value[page] = null
    if (previewUrls.value[page]) {
      URL.revokeObjectURL(previewUrls.value[page]!)
      previewUrls.value[page] = null
    }
    previewIsVideo.value[page] = false
    uiStore.showToast(`${pageLabels[page]} background uploaded`, 'success')
  } catch (e: unknown) {
    const maybeErr = e as { message?: string }
    uiStore.showToast(maybeErr?.message || 'Failed to upload background', 'error')
  }
}

const clearPageBackground = async (page: PageKey) => {
  setKeyForPage(page, null)
  await workspaceStore.updateMyWorkspace(patchForPage(page, null))
  uiStore.showToast(`${pageLabels[page]} background cleared`, 'success')
}

const isSaving = computed(() => workspaceStore.isLoading)

onMounted(async () => {
  await workspaceStore.fetchMyWorkspace()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="text-xl font-semibold">Workspace</p>
      <p class="text-sm opacity-80">Set page background images/videos for this workspace.</p>
    </div>

    <section class="flex items-center justify-between gap-4">
      <div class="text-sm opacity-80">Changes apply immediately.</div>
      <div class="text-sm opacity-80" v-if="isSaving">Saving…</div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="page in (['dashboard', 'day', 'search', 'settings'] as const)"
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
              @click="clearPageBackground(page)"
            />
          </div>
        </div>

        <div class="w-full rounded-xl overflow-hidden bg-black/20 border border-white/10">
          <video
            v-if="(previewUrls[page] && previewIsVideo[page]) || (!previewUrls[page] && resolvedUrls[page] && resolvedIsVideo[page])"
            class="w-full h-[160px] object-cover"
            :src="previewUrls[page] || resolvedUrls[page] || ''"
            autoplay
            muted
            loop
            playsinline
          />
          <img
            v-else-if="previewUrls[page] || resolvedUrls[page]"
            class="w-full h-[160px] object-cover"
            :src="previewUrls[page] || resolvedUrls[page] || ''"
            alt="background preview"
          />
          <div v-else class="w-full h-[160px] flex items-center justify-center text-sm opacity-70">
            No background
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            class="block w-full text-sm"
            @change="(e) => handleFileSelected(page, e)"
          />

          <div class="flex items-center gap-2">
            <SettingsButton
              preset="compact"
              label="Upload"
              icon="upload"
              :disabled="!selectedFiles[page]"
              @click="uploadPageBackground(page)"
            />
          </div>

          <!-- <p class="text-xs opacity-70 break-all">Key: {{ getKeyForPage(page) || '—' }}</p> -->
        </div>
      </div>
    </section>
  </div>
</template>
