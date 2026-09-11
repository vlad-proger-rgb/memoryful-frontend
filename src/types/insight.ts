import type { ChatModelRef } from './chat'
import type { FAIcon } from './fontawesome'

/** What an AI item does: name something, or propose something. */
export type InsightKind = 'observation' | 'suggestion'

export interface InsightInDB {
  id: string
  userId: string
  chatModel: ChatModelRef
  timestamp: number
  kind: InsightKind
  description: string
  icon?: FAIcon | null
  content: string
  createdAt: string
}
