import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface ConfirmOptions {
  title: string
  message?: string
  detail?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'neutral' | 'danger'
}

export const useUiStore = defineStore('ui', () => {
  const theme = ref('light')
  const disableScroll = ref(false)

  const toastMessage = ref('')
  const toastType = ref<'success' | 'error' | 'info'>('info')
  const isToastVisible = ref(false)
  let toastTimeout: number | null = null

  // Outlives isConfirmOpen on purpose: clearing it on close would blank the text mid-leave.
  const confirmOptions = ref<ConfirmOptions | null>(null)
  const isConfirmOpen = ref(false)
  let resolveConfirmPromise: ((ok: boolean) => void) | null = null

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

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    resolveConfirmPromise?.(false)
    confirmOptions.value = options
    isConfirmOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolveConfirmPromise = resolve
    })
  }

  const resolveConfirm = (ok: boolean) => {
    isConfirmOpen.value = false
    resolveConfirmPromise?.(ok)
    resolveConfirmPromise = null
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
    confirmOptions,
    isConfirmOpen,
    confirm,
    resolveConfirm,
  }
})

export default useUiStore
