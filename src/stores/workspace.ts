import { ref } from 'vue'
import { defineStore } from 'pinia'

import workspacesApi, { type WorkspaceResponse } from '@/api/workspaces'
import { useApiError } from '@/composables'
import { DEFAULT_BACKGROUNDS } from '@/config/workspaceDefaults'
import { WORKSPACE_PAGES } from '@/types/workspace'
import type {
  WorkspaceBackgroundInput,
  WorkspaceBackgrounds,
  WorkspacePageKey,
} from '@/types/workspace'

export const useWorkspaceStore = defineStore('workspace', () => {
  const { errorMessage, isLoading, withLoading } = useApiError()

  // Seeded with the bundled defaults so backgrounds paint before the API answers.
  const backgrounds = ref<WorkspaceBackgrounds>({ ...DEFAULT_BACKGROUNDS })

  const isDefault = (page: WorkspacePageKey) => !backgrounds.value[page].key

  function applyResponse(data: WorkspaceResponse) {
    backgrounds.value = Object.fromEntries(
      WORKSPACE_PAGES.map((page) => [page, data.backgrounds?.[page] ?? DEFAULT_BACKGROUNDS[page]]),
    ) as WorkspaceBackgrounds
  }

  async function fetchMyWorkspace() {
    return await withLoading(async () => {
      const res = await workspacesApi.getMyWorkspace()
      if (res.code === 200 && res.data) {
        applyResponse(res.data)
        return true
      }
      return false
    })
  }

  async function setBackground(page: WorkspacePageKey, background: WorkspaceBackgroundInput) {
    return await withLoading(async () => {
      const res = await workspacesApi.updateMyWorkspace({ backgrounds: { [page]: background } })
      if (res.code === 200 && res.data) {
        applyResponse(res.data)
        return true
      }
      return false
    })
  }

  const clearBackground = (page: WorkspacePageKey) => setBackground(page, { key: null })

  return {
    backgrounds,
    errorMessage,
    isLoading,
    isDefault,
    fetchMyWorkspace,
    setBackground,
    clearBackground,
  }
})

export default useWorkspaceStore
