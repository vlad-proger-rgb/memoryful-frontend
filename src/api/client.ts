import axios from 'axios'
import type { ApiResponse } from '@/types'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || ''

axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("axios.interceptors.response.use - error: ", error)
    const errorResponse: ApiResponse = {
      code: error.response?.status || 500,
      msg: error.response?.data?.detail || error.response?.data?.message || 'Unknown error occurred'
    }
    console.error("axios.interceptors.response.use - errorResponse: ", errorResponse)

    if (!error.response) {
      errorResponse.msg = 'Network error. Please check your connection'
    }

    return Promise.reject(errorResponse)
  }
)

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export default axios
