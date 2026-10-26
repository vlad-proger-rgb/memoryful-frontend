import storageApi from '@/api/storage'

// Module-level so every component shares one cache, and `inFlight` collapses identical
// requests when a list mounts many items at once. Entries expire well inside the presigned
// URL's lifetime, so a long-lived tab never serves an expired one.
const CACHE_TTL_MS = 60 * 60 * 1000

const cache = new Map<string, { url: string; expiresAt: number }>()
const inFlight = new Map<string, Promise<string | null>>()

export function useStorageResolve() {
  const resolveStorageSrc = async (src: string | undefined | null): Promise<string | null> => {
    if (!src) return null

    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
      return src
    }

    if (src.startsWith('users/')) {
      const cached = cache.get(src)
      if (cached && cached.expiresAt > Date.now()) return cached.url

      const existing = inFlight.get(src)
      if (existing) return existing

      const promise = (async () => {
        try {
          const res = await storageApi.presignGet({ objectKey: src })
          const url = res.data?.downloadUrl || null
          if (url) cache.set(src, { url, expiresAt: Date.now() + CACHE_TTL_MS })
          return url
        } finally {
          inFlight.delete(src)
        }
      })()

      inFlight.set(src, promise)
      return promise
    }

    return null
  }

  return { resolveStorageSrc }
}
