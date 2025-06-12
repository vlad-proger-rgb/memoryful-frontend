export interface TrackableType {
  id: string
  name: string
  description?: string
  valueType: string
  icon?: string
  meta?: Record<string, unknown>
}
