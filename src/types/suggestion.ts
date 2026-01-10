import type { FAIcon } from './fontawesome'

export interface SuggestionInDB {
  id: string
  userId: string
  modelId: string
  description: string
  icon?: FAIcon | null
  date: string
  content: string
}
