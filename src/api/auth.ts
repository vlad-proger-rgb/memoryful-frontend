import axios from '@/api/client'
import type { ApiResponse, User, AuthResponse, GoogleNonce } from '@/types'

export const authApi = {
  requestVerificationCode(email: string): Promise<ApiResponse<null>> {
    return axios.post('/auth/request-code', { email })
  },

  verifyCode(email: string, code: string): Promise<ApiResponse<AuthResponse>> {
    return axios.post('/auth/verify-code', { email, code })
  },

  requestGoogleNonce(): Promise<ApiResponse<GoogleNonce>> {
    return axios.post('/auth/google/nonce')
  },

  signInWithGoogle(credential: string): Promise<ApiResponse<AuthResponse>> {
    return axios.post('/auth/google', { credential })
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
