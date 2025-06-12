import type { City, CityDetail } from './city'
import type { DayTrackableProgress, DayTrackableTypeWithProgress } from './day-trackable-progress'
import type { Tag } from './tag'

export interface DayListItem {
  timestamp: number
  description?: string
  steps: number
  starred: boolean
  mainImage?: string
  city: City
  trackableProgresses?: DayTrackableProgress[]
  exists: boolean
}

export interface DayDetail {
  timestamp: number
  content: string
  city: CityDetail
  description?: string
  steps: number
  starred: boolean
  mainImage?: string
  createdAt: string
  updatedAt: string
  images?: string[]
  tags?: Tag[]
  trackableProgresses?: DayTrackableTypeWithProgress[]
}

export interface DayCreate {
  cityId: string
  description?: string
  content: string
  steps?: number
  mainImage?: string
  images?: string[]
  tags?: Tag[]
  trackableProgresses?: DayTrackableTypeWithProgress[]
}

export interface DayUpdate {
  cityId?: string
  description?: string
  content?: string
  steps?: number
  starred?: boolean
  mainImage?: string
  images?: string[]
  tags?: Tag[]
  trackableProgresses?: DayTrackableTypeWithProgress[]
}

/**
 * Advanced filters for days querying.
 */
export interface DayFilters {
  /**
   * Filter by steps. Operators: gt, lt, gte, lte, eq, ne. Example: {gt: 5000}
   */
  steps?: {
    gt?: number
    lt?: number
    gte?: number
    lte?: number
    eq?: number
    ne?: number
  }

  /**
   * Filter by description. Operators: like, eq, ne. Example: {like: 'park'}
   */
  description?: {
    like?: string
    eq?: string
    ne?: string
  }

  /**
   * Filter by starred status
   */
  starred?: boolean

  /**
   * Filter by city ID
   */
  cityId?: string

  /**
   * Filter by creation timestamp (after)
   */
  createdAfter?: number

  /**
   * Filter by creation timestamp (before)
   */
  createdBefore?: number
}
