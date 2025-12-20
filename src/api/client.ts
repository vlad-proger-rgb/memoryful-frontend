import axios from 'axios'
import type { AxiosRequestHeaders, AxiosError } from 'axios'
import type { ApiResponse } from '@/types'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || ''
axios.defaults.withCredentials = true

let refreshPromise: Promise<string> | null = null

const clearAuthStorage = () => {
  sessionStorage.removeItem('accessToken')
  setAuthToken(null)
}

const getHeader = (headers: unknown, key: string): unknown => {
  if (!headers || typeof headers !== 'object') return undefined
  if ('get' in headers && typeof (headers as { get?: unknown }).get === 'function') {
    return (headers as { get: (k: string) => unknown }).get(key)
  }
  const h = headers as Record<string, unknown>
  return h[key] ?? h[key.toLowerCase()]
}

const setHeader = (headers: unknown, key: string, value: string): unknown => {
  if (
    headers &&
    typeof headers === 'object' &&
    'set' in headers &&
    typeof (headers as { set?: unknown }).set === 'function'
  ) {
    ;(headers as { set: (k: string, v: string) => void }).set(key, value)
    return headers
  }
  const base = headers && typeof headers === 'object' ? (headers as Record<string, unknown>) : {}
  return { ...base, [key]: value }
}

const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.get('/api/auth/refresh')

  const accessToken = (response as unknown as ApiResponse<{ accessToken: string }>).data?.accessToken

  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Refresh succeeded but no access token was returned')
  }

  sessionStorage.setItem('accessToken', accessToken)
  setAuthToken(accessToken)
  return accessToken
}

axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken')
  if (token) {
    const existingAuth = getHeader(config.headers, 'Authorization')
    if (typeof existingAuth === 'string' && existingAuth.length > 0) {
      return config
    }
    const value = `Bearer ${token}`
    const headers = config.headers

    config.headers = setHeader(headers, 'Authorization', value) as unknown as AxiosRequestHeaders
  }
  return config
})

axios.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config

    if (status === 401 && originalRequest && !(originalRequest as unknown as { _retry?: boolean })._retry) {
      ;(originalRequest as unknown as { _retry?: boolean })._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const newAccessToken = await refreshPromise
        originalRequest.headers = setHeader(originalRequest.headers, 'Authorization', `Bearer ${newAccessToken}`) as unknown as AxiosRequestHeaders
        return axios(originalRequest)
      } catch {
        clearAuthStorage()
      }
    }

    console.error('axios.interceptors.response.use - error: ', error)
    const errorResponse: ApiResponse = {
      code: status || 500,
      msg: (error.response?.data as { detail?: string; message?: string } | undefined)?.detail ||
        (error.response?.data as { detail?: string; message?: string } | undefined)?.message ||
        'Unknown error occurred',
    }
    console.error('axios.interceptors.response.use - errorResponse: ', errorResponse)

    if (!error.response) {
      errorResponse.msg = 'Network error. Please check your connection'
    }

    return Promise.reject(errorResponse)
  },
)

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export default axios
