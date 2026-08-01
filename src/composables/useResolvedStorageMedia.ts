import { ref, watch } from 'vue'

import { useStorageResolve } from '@/composables'
import { isVideoPath } from '@/utils/media'

type MaybeKey = string | null | undefined

interface UseResolvedStorageMediaOptions {
  fallbackSrc?: string | null
  fallbackIsVideo?: boolean
}

export function useResolvedStorageMedia(
  keySource: () => MaybeKey,
  options: UseResolvedStorageMediaOptions = {},
) {
  const { resolveStorageSrc } = useStorageResolve()

  const url = ref<string | null>(options.fallbackSrc ?? null)
  const isVideo = ref<boolean>(options.fallbackIsVideo ?? false)

  watch(
    keySource,
    async (next) => {
      if (!next) {
        url.value = options.fallbackSrc ?? null
        isVideo.value = options.fallbackIsVideo ?? false
        return
      }

      url.value = await resolveStorageSrc(next)
      isVideo.value = isVideoPath(next)
    },
    { immediate: true },
  )

  return { url, isVideo }
}
