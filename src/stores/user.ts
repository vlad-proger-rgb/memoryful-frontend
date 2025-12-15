import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import authApi from '@/api/auth'
import { setAuthToken } from '@/api/client'
import { useApiError } from '@/composables'
import type { User, Token } from '@/types'

export const useUserStore = defineStore('user', () => {
  const { errorMessage, isLoading, withLoading } = useApiError()

  const user = ref<User>({
    city: {
      id: '',
      name: '',
      country: {
        id: '',
        name: '',
        code: '',
      },
    },
    country: {
      id: '',
      name: '',
      code: '',
    },
    email: '',
    firstName: '',
    bio: '',
  })

  const token = ref<Token | null>(null)

  function setUser(data: Partial<User>) {
    user.value = { ...user.value, ...data }
  }

  function setToken(tokenData: Token) {
    token.value = tokenData
    localStorage.setItem('accessToken', tokenData.accessToken)
    setAuthToken(tokenData.accessToken)
  }

  function clearUser() {
    user.value = {
      city: {
        id: '',
        name: '',
        country: {
          id: '',
          name: '',
          code: '',
        },
      },
      country: {
        id: '',
        name: '',
        code: '',
      },
      email: '',
      firstName: '',
      bio: '',
    }
    token.value = null
    localStorage.removeItem('accessToken')
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

      if ((response.code === 201 || response.code === 200) && response.data) {
        const accessToken = response.data.tokens?.accessToken
        if (!accessToken) {
          errorMessage.value = 'Login succeeded but no access token was returned'
          return [false, false] as [boolean, boolean]
        }

        setToken(response.data.tokens)
        user.value.id = response.data.userId

        await fetchUserDetails()

        return [true, response.data.isNewUser] as [boolean, boolean]
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
        const normalized = {
          ...response.data,
          city:
            (response.data as unknown as { city?: User['city'] | null }).city ??
            {
              id: '',
              name: '',
              country: {
                id: '',
                name: '',
                code: '',
              },
            },
          country:
            (response.data as unknown as { country?: User['country'] | null }).country ??
            {
              id: '',
              name: '',
              code: '',
            },
        } as User

        setUser(normalized)
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
      const userData: Partial<User> & { country?: User['country']; city?: User['city'] } = {
        firstName: user.value.firstName,
        bio: user.value.bio,
        photo: user.value.photo,
      }

      if (typeof user.value.age === 'number') {
        userData.age = user.value.age
      }

      const resolvedCountry = user.value.city?.country?.id ? user.value.city.country : user.value.country
      if (resolvedCountry?.id) {
        userData.country = resolvedCountry
      }

      if (user.value.city?.id) {
        userData.city = user.value.city
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
    const storedToken = localStorage.getItem('accessToken')
    if (storedToken) {
      setToken({
        accessToken: storedToken,
        tokenType: 'bearer',
      })
      await fetchUserDetails()
    }
  }

  const isAuthenticated = computed(() => !!token.value)
  const isProfileComplete = computed(
    () => !!user.value.firstName && !!user.value.city,
  )

  return {
    user,
    errorMessage,
    isLoading,
    setUser,
    clearUser,
    requestVerificationCode,
    verifyCode,
    fetchUserDetails,
    updateUserProfile,
    logout,
    initializeFromStorage,
    isAuthenticated,
    isProfileComplete,
  }
})
