import type { WorkspaceBackground } from './workspace'

export interface Month {
  year: number
  month: number
  description: string
  backgroundImage: string
  backgroundPlaceholder?: string | null
  topDayTimestamp: number
  resolved?: WorkspaceBackground | null
}
