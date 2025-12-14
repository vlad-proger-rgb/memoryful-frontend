import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const theme = ref('light')
  const disableScroll = ref(false)

  const toastMessage = ref('')
  const toastType = ref<'success' | 'error' | 'info'>('info')
  const isToastVisible = ref(false)
  let toastTimeout: number | null = null

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const hideToast = () => {
    isToastVisible.value = false
    toastMessage.value = ''
    if (toastTimeout) {
      clearTimeout(toastTimeout)
      toastTimeout = null
    }
  }

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    timeoutMs = 2500,
  ) => {
    toastMessage.value = message
    toastType.value = type
    isToastVisible.value = true

    if (toastTimeout) {
      clearTimeout(toastTimeout)
      toastTimeout = null
    }

    if (timeoutMs > 0) {
      toastTimeout = window.setTimeout(() => {
        hideToast()
      }, timeoutMs) as unknown as number
    }
  }

  const isDark = computed(() => theme.value === 'dark')

  return {
    theme,
    disableScroll,
    toggleTheme,
    isDark,
    toastMessage,
    toastType,
    isToastVisible,
    showToast,
    hideToast,
  }
})

export default useUiStore
