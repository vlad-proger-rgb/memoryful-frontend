import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const theme = ref('light')
  const disableScroll = ref(false)

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const isDark = computed(() => theme.value === 'dark')

  return {
    theme,
    disableScroll,
    toggleTheme,
    isDark,
  }
})

export default useUiStore
