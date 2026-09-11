import type { ChatModelRef } from './chat'
import type { FAIcon } from './fontawesome'

export interface WeekDigestSection {
  description: string
  icon?: FAIcon | null
  content: string
}

export interface WeekDigestInDB {
  id: string
  userId: string
  chatModel: ChatModelRef
  /** Monday, UTC, as an ISO date. Also the key the detail endpoint takes. */
  weekStart: string
  title: string
  summary: string
  sections: WeekDigestSection[]
  sourceDayCount: number
  createdAt: string
  /** Moves every time the digest is regenerated. */
  updatedAt: string
}
