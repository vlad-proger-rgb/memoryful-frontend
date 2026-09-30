import { watch, type Ref, type WatchStopHandle } from 'vue'

import STORAGE_KEYS from '@/constants/storageKeys'
import storage from '@/utils/storage'
import type { DayDetail } from '@/types'

interface DayDraft {
  description: string
  content: string
}

/** Keeps the unsaved text of a day in localStorage, so a reload mid-edit loses nothing. */
export function useDayDraft(day: Ref<DayDetail>, form: DayDraft) {
  let stopTracking: WatchStopHandle | null = null

  const key = () => STORAGE_KEYS.DATA.DAY_DRAFT(day.value.timestamp)

  const differsFromDay = (draft: DayDraft) =>
    draft.content !== (day.value.content || '') ||
    draft.description !== (day.value.description || '')

  const persist = () => {
    const draft = { description: form.description, content: form.content }
    try {
      if (differsFromDay(draft)) storage.set(key(), draft)
      else storage.remove(key())
    } catch {
      // A full or blocked storage only costs the draft.
    }
  }

  /** Loads a stored draft into the form, then keeps tracking it. Returns whether one was restored. */
  const restore = () => {
    const draft = storage.get<DayDraft>(key())
    const restored = !!draft && differsFromDay(draft)
    if (restored) {
      form.description = draft.description
      form.content = draft.content
    }
    stopTracking?.()
    // Sync, so a value flushed during page unload is written before the page is gone.
    stopTracking = watch(() => [form.description, form.content], persist, { flush: 'sync' })
    return restored
  }

  const clear = () => {
    try {
      storage.remove(key())
    } catch {
      // Nothing stored is nothing to clear.
    }
  }

  return { restore, clear }
}
