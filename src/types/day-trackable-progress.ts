import type { TrackableInDB } from './trackable'
import type { TrackableType } from './trackable-type'

export interface DayTrackableProgress {
  value: number
  description: string
  trackableItem: TrackableInDB
}

export interface DayTrackableProgressUpdate {
  value?: number
  description: string
  trackableItemId: string
}

export interface DayTrackableTypeWithProgress {
  id: string
  type: TrackableType
  progresses: DayTrackableProgress[]
}
