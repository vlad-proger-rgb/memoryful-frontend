import type { City } from './city'
import type { LearningProgress } from './learning-items'

export interface DayListItem {
  timestamp: number
  description?: string
  steps: number
  starred: boolean
  mainImage?: string
  city: City
  learningProgresses?: LearningProgress[]
  exists: boolean
}

export interface DayDetail {
  timestamp: number
  content: string
  city: City
  description?: string
  steps: number
  starred: boolean
  mainImage?: string
  createdAt: string
  updatedAt: string
  images?: string[]
  learningProgresses?: LearningProgress[]
}

export interface DayCreate {
  cityId: string
  description?: string
  content: string
  steps?: number
  mainImage?: string
  images?: string[]
  learningProgresses?: LearningProgress[]
}

export interface DayUpdate {
  cityId?: string
  description?: string
  content?: string
  steps?: number
  starred?: boolean
  mainImage?: string
  images?: string[]
  learningProgresses?: LearningProgress[]
}
