import { ref, onBeforeUnmount } from 'vue'

export function useAutocomplete<T>({
  fetchItems,
  minQueryLength = 2,
  debounce = 300,
}: {
  fetchItems: (query: string) => Promise<T[]>
  minQueryLength?: number
  debounce?: number
}) {
  const query = ref('')
  const items = ref<T[]>([])
  const isLoading = ref(false)
  const isOpen = ref(false)
  const error = ref<Error | null>(null)

  let timeoutId: number | null = null

  const search = async (newQuery: string) => {
    query.value = newQuery

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (query.value.length < minQueryLength) {
      items.value = []
      isOpen.value = false
      return
    }

    timeoutId = window.setTimeout(async () => {
      try {
        isLoading.value = true
        error.value = null
        const results = await fetchItems(query.value)
        items.value = results
        isOpen.value = results.length > 0
      } catch (err) {
        error.value = err as Error
        items.value = []
      } finally {
        isLoading.value = false
      }
    }, debounce)
  }

  const reset = () => {
    query.value = ''
    items.value = []
    isOpen.value = false
    error.value = null
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const close = () => {
    isOpen.value = false
  }

  const open = () => {
    if (items.value.length > 0) {
      isOpen.value = true
    }
  }

  onBeforeUnmount(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    query,
    items,
    isLoading,
    isOpen,
    error,
    search,
    reset,
    close,
    open,
  }
}
