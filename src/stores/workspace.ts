import { ref } from 'vue'
import { defineStore } from 'pinia'

import workspacesApi from '@/api/workspaces'
import { useApiError } from '@/composables'
import type { WorkspaceSettings } from '@/types/workspace'

export const useWorkspaceStore = defineStore('workspace', () => {
  const { errorMessage, isLoading, withLoading } = useApiError()

  const settings = ref<WorkspaceSettings>({
    dashboardBackground: null,
    dayBackground: null,
    searchBackground: null,
    settingsBackground: null,
  })

  function setSettings(next: Partial<WorkspaceSettings>) {
    settings.value = { ...settings.value, ...next }
  }

  async function fetchMyWorkspace() {
    return await withLoading(async () => {
      const res = await workspacesApi.getMyWorkspace()
      if (res.code === 200 && res.data) {
        settings.value = {
          dashboardBackground: res.data.dashboardBackground ?? null,
          dayBackground: res.data.dayBackground ?? null,
          searchBackground: res.data.searchBackground ?? null,
          settingsBackground: res.data.settingsBackground ?? null,
        }
        return true
      }
      return false
    })
  }

  async function updateMyWorkspace(patch: Partial<WorkspaceSettings>) {
    return await withLoading(async () => {
      const res = await workspacesApi.updateMyWorkspace(patch)
      if (res.code === 200 && res.data) {
        settings.value = {
          dashboardBackground: res.data.dashboardBackground ?? null,
          dayBackground: res.data.dayBackground ?? null,
          searchBackground: res.data.searchBackground ?? null,
          settingsBackground: res.data.settingsBackground ?? null,
        }
        return true
      }
      return false
    })
  }

  return {
    settings,
    errorMessage,
    isLoading,
    setSettings,
    fetchMyWorkspace,
    updateMyWorkspace,
  }
})

export default useWorkspaceStore
