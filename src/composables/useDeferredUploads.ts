import { onBeforeUnmount } from 'vue'

import { useStorageUpload, type UploadToStorageParams } from './useStorageUpload'

/** Holds picked files behind local preview URLs and uploads them only when committed. */
export function useDeferredUploads() {
  const { uploadToStorage } = useStorageUpload()
  const staged = new Map<string, UploadToStorageParams>()

  /** Reads the file once, so the preview and the later upload never touch the picked file again. */
  const stage = async (params: UploadToStorageParams) => {
    const { file } = params
    // Android Chrome can lose read access to a picked file, so it is read exactly once.
    const bytes = await file.arrayBuffer().catch(() => {
      throw new Error(`Could not read ${file.name}. Pick it again.`)
    })
    const copy = new File([bytes], file.name, { type: file.type })

    const previewUrl = URL.createObjectURL(copy)
    staged.set(previewUrl, { ...params, file: copy })
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
