import type { Token } from '@/types/auth.ts'

export interface User {
  id?: string
  country_id?: string
  city_id?: string
  email: string
  first_name?: string
  last_name?: string
  age?: number
  job_title?: string
  photo?: string
}

export interface UserState {
  user: User
  isNewUser: boolean
  token: Token | null
  errorMessage: string
  isLoading: boolean
}
