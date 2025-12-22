import type { FAIcon } from '@/types/fontawesome'

export interface TrackableType {
  id: string
  name: string
  description?: string
  valueType: string
  icon?: FAIcon
  metaSchema?: Record<string, unknown>
}

export type TrackableTypeCreate = Omit<TrackableType, 'id'>

export type TrackableTypeUpdate = Partial<TrackableTypeCreate>
