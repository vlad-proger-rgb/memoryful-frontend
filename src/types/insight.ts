import type { FAIcon } from './fontawesome'

export interface InsightInDB {
  id: string
  userId: string
  modelId: string
  insightTypeId: string
  dateBegin: string
  description: string
  icon?: FAIcon | null
  content: string
  createdAt: string
}
