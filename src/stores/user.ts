import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { setAuthToken } from '@/api/client'
import { useApiError } from '@/composables/useApiError'
import type { User, Token } from '@/types'

export const useUserStore = defineStore('user', () => {
  const { errorMessage, isLoading, withLoading } = useApiError()

  const user = ref<User>({
    country_id: '',
    city_id: '',
    email: '',
    first_name: '',
    job_title: '',
  })

  const token = ref<Token | null>(null)

  function setUser(data: User) {
    user.value = { ...user.value, ...data }
  }

  function setToken(tokenData: Token) {
    token.value = tokenData
    localStorage.setItem('access_token', tokenData.access_token)
    setAuthToken(tokenData.access_token)
  }

  function clearUser() {
    user.value = {
      country_id: '',
      city_id: '',
      email: '',
      first_name: '',
      job_title: '',
    }
    token.value = null
    localStorage.removeItem('access_token')
    setAuthToken(null)
  }

  async function requestVerificationCode() {
    return await withLoading(async () => {
      const response = await authApi.requestVerificationCode(user.value.email)

      if (response.code === 200) {
        return true
      } else {
        errorMessage.value = response.msg || 'Failed to send verification code'
        return false
      }
    })
  }

  async function verifyCode(code: string): Promise<[boolean, boolean] | false> {
    const result = await withLoading(async () => {
      const response = await authApi.verifyCode(user.value.email, code)

      if (response.code === 201 && response.data) {
        setToken(response.data.tokens)
        user.value.id = response.data.user_id

        await fetchUserDetails()

        return [true, response.data.is_new_user] as [boolean, boolean]
      } else {
        errorMessage.value = response.msg || 'Code verification failed'
        return [false, false] as [boolean, boolean]
      }
    })

    if (result === false) {
      return [false, false]
    }

    return result
  }

  async function fetchUserDetails() {
    if (!token.value) return false

    try {
      const response = await authApi.getUserDetails()
      if (response.code === 200 && response.data) {
        setUser(response.data)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      return false
    }
  }

  async function updateUserProfile() {
    return await withLoading(async () => {
      const userData = {
        first_name: user.value.first_name,
        country_id: user.value.country_id,
        city_id: user.value.city_id,
        job_title: user.value.job_title,
      }

      const response = await authApi.updateUserProfile(userData)

      if (response.code === 200) {
        return true
      } else {
        errorMessage.value = response.msg || 'Failed to update profile'
        return false
      }
    })
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearUser()
    }
  }

  async function initializeFromStorage() {
    const storedToken = localStorage.getItem('access_token')
    if (storedToken) {
      setToken({
        access_token: storedToken,
        token_type: 'bearer',
      })
      await fetchUserDetails()
    }
  }

  const isAuthenticated = computed(() => !!token.value)
  const isProfileComplete = computed(
    () => !!user.value.first_name && !!user.value.country_id && !!user.value.city_id && !!user.value.job_title,
  )

  return {
    user,
    errorMessage,
    isLoading,
    setUser,
    clearUser,
    requestVerificationCode,
    verifyCode,
    updateUserProfile,
    logout,
    initializeFromStorage,
    isAuthenticated,
    isProfileComplete,
  }
})
