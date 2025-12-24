import axios from '@/api/client'
import type { ApiResponse } from '@/types'

export interface WorkspaceSettings {
  dashboardBackground?: string | null
  dayBackground?: string | null
  searchBackground?: string | null
  settingsBackground?: string | null
}

export const workspacesApi = {
  getMyWorkspace(): Promise<ApiResponse<WorkspaceSettings>> {
    return axios.get('/api/workspaces/me')
  },
  updateMyWorkspace(body: WorkspaceSettings): Promise<ApiResponse<WorkspaceSettings>> {
    return axios.put('/api/workspaces/me', body)
  },
}

export default workspacesApi
