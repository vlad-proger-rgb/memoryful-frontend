import axios from '@/api/client'
import type { ApiResponse, Session } from '@/types'

export const sessionsApi = {
  listSessions(): Promise<ApiResponse<Session[]>> {
    return axios.get('/auth/sessions')
  },

  revokeSession(sessionId: string): Promise<ApiResponse<null>> {
    return axios.delete(`/auth/sessions/${sessionId}`)
  },

  logoutAll(): Promise<ApiResponse<null>> {
    return axios.post('/auth/logout-all')
  },
}

export default sessionsApi
