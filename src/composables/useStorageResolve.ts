import storageApi from '@/api/storage'

// Module-level (singleton) cache shared by every component that calls
// `useStorageResolve()`, so re-mounting a component for the same object key
// (e.g. opening the fullscreen viewer for an image already shown as a
// thumbnail) reuses the previously resolved presigned URL instead of
// re-hitting `/storage/presign-get`. In-flight requests are deduped too, in
// case multiple components resolve the same key concurrently.
const cache = new Map<string, string>()
const inFlight = new Map<string, Promise<string | null>>()

export function useStorageResolve() {
  const resolveStorageSrc = async (src: string | undefined | null): Promise<string | null> => {
    if (!src) return null

    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src
    }

    if (src.startsWith('users/')) {
      const cached = cache.get(src)
      if (cached) return cached

      const existing = inFlight.get(src)
      if (existing) return existing

      const promise = (async () => {
        try {
          const res = await storageApi.presignGet({ objectKey: src })
          const url = res.data?.downloadUrl || null
          if (url) cache.set(src, url)
          return url
        } finally {
          inFlight.delete(src)
        }
      })()

      inFlight.set(src, promise)
      return promise
    }

    return '/src/assets/img/' + src
  }

  return { resolveStorageSrc }
}
