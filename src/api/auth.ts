import axios from '@/api/client'
import type { ApiResponse, User, AuthResponse } from '@/types'

export const authApi = {
  requestVerificationCode(email: string): Promise<ApiResponse<null>> {
    return axios.post('/auth/request-code', { email })
  },

  verifyCode(email: string, code: string): Promise<ApiResponse<AuthResponse>> {
    return axios.post('/auth/verify-code', { email, code })
  },

  getUserDetails(): Promise<ApiResponse<User>> {
    return axios.get('/auth/me')
  },

  updateUserProfile(userData: Partial<User>): Promise<ApiResponse<null>> {
    return axios.put('/auth/me', userData)
  },

  logout(): Promise<ApiResponse<null>> {
    return axios.get('/auth/logout')
  },

  refresh(): Promise<ApiResponse<{ accessToken: string; tokenType: string }>> {
    return axios.get('/auth/refresh')
  },
}

export default authApi
