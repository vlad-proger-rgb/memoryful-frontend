import type { FAIcon } from '@/types/fontawesome'

export interface TrackableType {
  id: string
  name: string
  description?: string
  valueType: string
  icon?: FAIcon
  meta?: Record<string, unknown>
}
