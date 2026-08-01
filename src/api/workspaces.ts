import axios from '@/api/client'
import type { ApiResponse } from '@/types'
import type {
  WorkspaceBackground,
  WorkspaceBackgroundInput,
  WorkspacePageKey,
} from '@/types/workspace'

export interface WorkspaceResponse {
  userId: string
  /** Only the pages the user has customized. */
  backgrounds: Partial<Record<WorkspacePageKey, WorkspaceBackground>>
}

export type WorkspaceUpdate = {
  backgrounds: Partial<Record<WorkspacePageKey, WorkspaceBackgroundInput>>
}

export const workspacesApi = {
  getMyWorkspace(): Promise<ApiResponse<WorkspaceResponse>> {
    return axios.get('/workspaces/me')
  },
  updateMyWorkspace(body: WorkspaceUpdate): Promise<ApiResponse<WorkspaceResponse>> {
    return axios.put('/workspaces/me', body)
  },
}

export default workspacesApi
