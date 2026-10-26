import type { City, CityDetail } from './city'
import type {
  DayTrackableProgress,
  DayTrackableProgressUpdate,
  DayTrackableTypeWithProgress,
} from './day-trackable-progress'
import type { Tag } from './tag'
import type { InsightInDB } from './insight'

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

export interface DaySummary {
  oldest: number | null
  newest: number | null
  today: DayListItem | null
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
  insights?: InsightInDB[]
}

export interface DayCreate {
  cityId: string
  description?: string
  content: string
  steps?: number
  mainImage?: string
  images?: string[]
  tags?: string[]
  trackableProgresses?: DayTrackableProgressUpdate[]
}

export interface DayUpdate {
  cityId?: string
  description?: string
  content?: string
  steps?: number
  starred?: boolean
  mainImage?: string
  images?: string[]
  tags?: string[]
  trackableProgresses?: DayTrackableProgressUpdate[]
}

export interface DayFilters {
  steps?: {
    gt?: number
    lt?: number
    gte?: number
    lte?: number
    eq?: number
    ne?: number
  }
  description?: {
    like?: string
    eq?: string
    ne?: string
  }
  starred?: boolean
  cityId?: string
  countryId?: string
  createdAfter?: number
  createdBefore?: number
}
