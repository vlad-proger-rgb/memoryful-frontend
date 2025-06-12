export interface TrackableBase {
  title: string
  description?: string
  icon?: string
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
  icon?: string
  meta?: Record<string, unknown>
}
