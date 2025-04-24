import type { Token } from '@/types/auth.ts'

export interface User {
  id?: string
  countryId?: string
  cityId?: string
  email: string
  firstName?: string
  lastName?: string
  age?: number
  jobTitle?: string
  photo?: string
}

export interface UserState {
  user: User
  isNewUser: boolean
  token: Token | null
  errorMessage: string
  isLoading: boolean
}
