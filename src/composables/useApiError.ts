import { ref } from 'vue'
import type { ApiResponse } from '@/types'

export function useApiError() {
  const errorMessage = ref<string>('')
  const isLoading = ref<boolean>(false)

  const handleApiError = (error: ApiResponse | any): string => {
    console.error("handleApiError error: ", error)
    let message = 'Something went wrong. Please try again'

    if ('code' in error && 'msg' in error) {
      message = error.msg || 'Server error'
    }

    else if (error.response) {
      message = error.response.data?.msg || 'Server error. Please try again'
    } else if (error.request) {
      message = 'Network error. Please check your connection'
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
    withLoading
  }
}
