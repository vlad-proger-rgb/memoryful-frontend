import { ref } from 'vue'
import type { ApiResponse } from '@/types'
import { useUiStore } from '@/stores/ui'

export function useApiError() {
  const errorMessage = ref<string>('')
  const isLoading = ref<boolean>(false)
  const uiStore = useUiStore()

  const handleApiError = (error: ApiResponse | unknown): string => {
    console.error("handleApiError error: ", error)
    let message = 'Something went wrong. Please try again'
    let code: number | undefined

    if (typeof error === 'object' && error !== null && 'code' in error && 'msg' in error) {
      const apiError = error as ApiResponse
      message = apiError.msg || 'Server error'
      code = typeof apiError.code === 'number' ? apiError.code : undefined
    }

    else if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { msg?: string }; status?: number } }).response
      message = response?.data?.msg || 'Server error. Please try again'
      code = typeof response?.status === 'number' ? response.status : undefined
    } else if (typeof error === 'object' && error !== null && 'request' in error) {
      message = 'Network error. Please check your connection'
    }

    if (code === 401 || message === 'Could not validate credentials') {
      uiStore.showToast(message, 'error')
    }

    errorMessage.value = message
    return message
  }

  const resetError = () => {
    errorMessage.value = ''
  }

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T | false> => {
    isLoading.value = true
    resetError()

    try {
      return await fn()
    } catch (e: unknown) {
      console.error("withLoading e:", e)
      handleApiError(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    isLoading,
    handleApiError,
    resetError,
    withLoading,
  }
}

export default useApiError
