import { watch, type Ref, type WatchStopHandle } from 'vue'

import STORAGE_KEYS from '@/constants/storageKeys'
import storage from '@/utils/storage'
import type { DayDetail } from '@/types'

interface DayDraftForm {
  description: string
  content: string
  mainImage: string
  images: string[]
}

// Image fields are optional because drafts stored before they existed don't carry them.
interface DayDraft {
  description: string
  content: string
  mainImage?: string
  images?: string[]
}

/** Maps picked-but-unsaved images to references that survive a reload, and back. */
interface DraftImages {
  draftRef: (src: string) => string
  restore: (ref: string) => Promise<string | null>
  forgetDay: (dayTimestamp: number, keepRefs?: string[]) => Promise<void>
}

/** Keeps the unsaved text and images of a day across a reload. */
export function useDayDraft(day: Ref<DayDetail>, form: DayDraftForm, images: DraftImages) {
  let stopTracking: WatchStopHandle | null = null

  const key = () => STORAGE_KEYS.DATA.DAY_DRAFT(day.value.timestamp)

  const snapshot = (): DayDraft => ({
    description: form.description,
    content: form.content,
    mainImage: images.draftRef(form.mainImage),
    images: form.images.map(images.draftRef),
  })

  const differsFromDay = (draft: DayDraft) =>
    draft.content !== (day.value.content || '') ||
    draft.description !== (day.value.description || '') ||
    (draft.mainImage !== undefined && draft.mainImage !== (day.value.mainImage || '')) ||
    (draft.images !== undefined &&
      JSON.stringify(draft.images) !== JSON.stringify(day.value.images || []))

  const persist = () => {
    const draft = snapshot()
    try {
      if (differsFromDay(draft)) storage.set(key(), draft)
      else storage.remove(key())
    } catch {
      // A full or blocked storage only costs the draft.
    }
  }

  /** Loads a stored draft into the form, then keeps tracking it. Resolves to whether one was restored. */
  const restore = async () => {
    const timestamp = day.value.timestamp
    const stored = storage.get<DayDraft>(key())
    const draft = stored && differsFromDay(stored) ? stored : null

    if (draft) {
      const [mainImage, ...restoredImages] = await Promise.all(
        [draft.mainImage ?? form.mainImage, ...(draft.images ?? form.images)].map(images.restore),
      )
      // Stepping to another day while the images loaded makes this draft stale.
      if (day.value.timestamp !== timestamp) return false

      form.description = draft.description
      form.content = draft.content
      form.mainImage = mainImage ?? ''
      form.images = restoredImages.filter((src): src is string => src !== null)
    }

    void images.forgetDay(timestamp, draft ? [draft.mainImage ?? '', ...(draft.images ?? [])] : [])

    stopTracking?.()
    // Sync, so a value flushed during page unload is written before the page is gone.
    stopTracking = watch(() => JSON.stringify(snapshot()), persist, { flush: 'sync' })
    return !!draft
  }

  const clear = () => {
    try {
      storage.remove(key())
    } catch {
      // Nothing stored is nothing to clear.
    }
    void images.forgetDay(day.value.timestamp)
  }

  return { restore, clear }
}
