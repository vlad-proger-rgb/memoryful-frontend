import axios from '@/api/client'
import type { ApiResponse } from '@/types'
import type {
  WorkspaceBackground,
  WorkspaceBackgroundInput,
  WorkspacePageKey,
} from '@/types/workspace'
import { viaDevProxy } from '@/utils/storageUrl'

export interface WorkspaceResponse {
  userId: string
  backgrounds: Partial<Record<WorkspacePageKey, WorkspaceBackground>>
}

export type WorkspaceUpdate = {
  backgrounds: Partial<Record<WorkspacePageKey, WorkspaceBackgroundInput>>
}

const proxyBackgrounds = (workspace: WorkspaceResponse): void => {
  for (const background of Object.values(workspace.backgrounds)) {
    if (background?.url) background.url = viaDevProxy(background.url)
  }
}

export const workspacesApi = {
  async getMyWorkspace(): Promise<ApiResponse<WorkspaceResponse>> {
    const res: ApiResponse<WorkspaceResponse> = await axios.get('/workspaces/me')
    if (res.data) proxyBackgrounds(res.data)
    return res
  },
  async updateMyWorkspace(body: WorkspaceUpdate): Promise<ApiResponse<WorkspaceResponse>> {
    const res: ApiResponse<WorkspaceResponse> = await axios.put('/workspaces/me', body)
    if (res.data) proxyBackgrounds(res.data)
    return res
  },
}

export default workspacesApi
