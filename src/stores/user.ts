import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  age?: number
  bio?: string
  jobTitle?: string
  photoUrl?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  function setUser(data: User) {
    user.value = data
  }

  function clearUser() {
    user.value = null
  }

  const isLoaded = computed(() => !!user.value)

  return { user, setUser, clearUser, isLoaded }
})
