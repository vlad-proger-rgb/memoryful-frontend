import type { FAIcon } from '@/types/fontawesome'

export interface TrackableBase {
  title: string
  description?: string
  icon?: FAIcon
}

export interface TrackableInDB extends TrackableBase {
  id: string
}

export interface TrackableDetail extends TrackableInDB {
  meta: Record<string, unknown>
}

export interface TrackableCreate extends TrackableBase {
  typeId: string
  meta?: Record<string, unknown>
}

export interface TrackableUpdate {
  title?: string
  description?: string
  icon?: FAIcon
  meta?: Record<string, unknown>
}
