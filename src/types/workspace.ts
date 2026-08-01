/** The customizable pages, in the order the settings grid shows them. */
export const WORKSPACE_PAGES = ['dashboard', 'day', 'month', 'search', 'settings'] as const

export type WorkspacePageKey = (typeof WORKSPACE_PAGES)[number]

export interface WorkspaceBackground {
  /** Storage object key. Absent means the page uses its bundled default. */
  key?: string | null
  url?: string | null
  isVideo?: boolean
  posterUrl?: string | null
  /** Tiny inline WebP data URI, painted blurred while the real media loads. */
  placeholder?: string | null
}

export type WorkspaceBackgrounds = Record<WorkspacePageKey, WorkspaceBackground>

/** What the client sends; `key: null` clears the page back to its default. */
export interface WorkspaceBackgroundInput {
  key: string | null
  placeholder?: string | null
}
