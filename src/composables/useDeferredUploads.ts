import { onBeforeUnmount } from 'vue'

import { useStorageUpload, type UploadToStorageParams } from './useStorageUpload'

/** Holds picked files behind local preview URLs and uploads them only when committed. */
export function useDeferredUploads() {
  const { uploadToStorage } = useStorageUpload()
  const staged = new Map<string, UploadToStorageParams>()

  const stage = (params: UploadToStorageParams) => {
    const previewUrl = URL.createObjectURL(params.file)
    staged.set(previewUrl, params)
    return previewUrl
  }

  /** Uploads a staged file and returns its object key; anything else passes through unchanged. */
  const commit = async (src: string) => {
    const params = staged.get(src)
    if (!params) return src

    const objectKey = await uploadToStorage(params)

    staged.delete(src)
    URL.revokeObjectURL(src)

    return objectKey
  }

  const release = () => {
    staged.forEach((_, previewUrl) => URL.revokeObjectURL(previewUrl))
    staged.clear()
  }

  onBeforeUnmount(release)

  return { stage, commit, release }
}
