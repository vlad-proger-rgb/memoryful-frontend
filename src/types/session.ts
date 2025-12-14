export interface Session {
  id: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  expiresAt: string
  isCurrent?: boolean
}
