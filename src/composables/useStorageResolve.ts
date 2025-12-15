import { ref } from 'vue'
import storageApi from '@/api/storage'

export function useStorageResolve() {
  const cache = ref(new Map<string, string>())

  const resolveStorageSrc = async (src: string | undefined | null): Promise<string | null> => {
    if (!src) return null

    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src
    }

    if (src.startsWith('users/')) {
      const cached = cache.value.get(src)
      if (cached) return cached

      const res = await storageApi.presignGet({ objectKey: src })
      const url = res.data?.downloadUrl || null
      if (url) cache.value.set(src, url)
      return url
    }

    return '/src/assets/img/' + src
  }

  return { resolveStorageSrc }
}
