import axios from '@/api/client'
import type { ApiResponse, User, AuthResponse } from '@/types'

export const authApi = {
  requestVerificationCode(email: string): Promise<ApiResponse<null>> {
    return axios.post('/api/auth/request-code', { email })
  },

  verifyCode(email: string, code: string): Promise<ApiResponse<AuthResponse>> {
    return axios.post('/api/auth/verify-code', { email, code })
  },

  getUserDetails(): Promise<ApiResponse<User>> {
    return axios.get('/api/auth/me')
  },

  updateUserProfile(userData: Partial<User>): Promise<ApiResponse<null>> {
    return axios.put('/api/auth/me', userData)
  },

  logout(): Promise<ApiResponse<null>> {
    return axios.get('/api/auth/logout')
  },
}

export default authApi
