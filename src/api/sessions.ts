import axios from '@/api/client'
import type { ApiResponse, Session } from '@/types'

export const sessionsApi = {
  listSessions(): Promise<ApiResponse<Session[]>> {
    return axios.get('/api/auth/sessions')
  },

  revokeSession(sessionId: string): Promise<ApiResponse<null>> {
    return axios.delete(`/api/auth/sessions/${sessionId}`)
  },
}

export default sessionsApi
