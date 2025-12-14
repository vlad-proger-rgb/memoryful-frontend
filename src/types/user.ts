import type { Token } from '@/types/auth.ts'
import type { CityDetail, Country } from '@/types'

export interface User {
  id?: string
  country?: Country
  city: CityDetail
  email: string
  firstName?: string
  lastName?: string
  age?: number
  bio?: string
  photo?: string
}

export interface UserState {
  user: User
  isNewUser: boolean
  token: Token | null
  errorMessage: string
  isLoading: boolean
}
