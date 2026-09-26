import { computed, ref } from 'vue'

import STORAGE_KEYS from '@/constants/storageKeys'
import { latestFinishedWeek } from '@/utils/dates'

const readLastSeenWeek = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.UI.DIGEST_SEEN_WEEK) ?? ''
  } catch {
    return ''
  }
}

/** Whether the newest weekly digest is unread. There is no digest table yet, so this lives in
 *  the browser; swap it for `viewed_at` once the backend writes digests. */
export function useDigestUnread() {
  const latestWeek = latestFinishedWeek()
  const lastSeenWeek = ref(readLastSeenWeek())

  const hasUnread = computed(() => lastSeenWeek.value !== latestWeek.startIso)

  const markSeen = () => {
    lastSeenWeek.value = latestWeek.startIso
    try {
      localStorage.setItem(STORAGE_KEYS.UI.DIGEST_SEEN_WEEK, latestWeek.startIso)
    } catch {
      // A blocked storage only costs the dot its memory.
    }
  }

  return { hasUnread, markSeen }
}
