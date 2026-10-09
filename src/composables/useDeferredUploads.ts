import { onBeforeUnmount } from 'vue'

import {
  deleteStagedImage,
  getDayStagedImages,
  getStagedImage,
  putStagedImage,
} from '@/utils/stagedImages'

import { useStorageUpload, type UploadToStorageParams } from './useStorageUpload'

interface StagedUpload {
  id: string
  params: UploadToStorageParams
}

const DRAFT_REF_PREFIX = 'staged:'

const newId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

/** Holds picked files behind local preview URLs and uploads them only when committed. */
export function useDeferredUploads() {
  const { uploadToStorage } = useStorageUpload()
  const staged = new Map<string, StagedUpload>()

  const track = (id: string, params: UploadToStorageParams) => {
    const previewUrl = URL.createObjectURL(params.file)
    staged.set(previewUrl, { id, params })
    return previewUrl
  }

  /** Reads the file once, so the preview and the later upload never touch the picked file again. */
  const stage = async (params: UploadToStorageParams) => {
    const { file } = params
    // Android Chrome can lose read access to a picked file, so it is read exactly once.
    const bytes = await file.arrayBuffer().catch(() => {
      throw new Error(`Could not read ${file.name}. Pick it again.`)
    })
    const copied = { ...params, file: new File([bytes], file.name, { type: file.type }) }

    const id = newId()
    if (params.dayTimestamp !== undefined) {
      // A failed write only costs the image surviving a reload.
      await putStagedImage({ id, dayTimestamp: params.dayTimestamp, params: copied }).catch(
        () => {},
      )
    }
    return track(id, copied)
  }

  const isStaged = (src: string) => staged.has(src)

  /** A reference to `src` that survives a reload, unlike a preview URL. */
  const draftRef = (src: string) => {
    const entry = staged.get(src)
    return entry ? `${DRAFT_REF_PREFIX}${entry.id}` : src
  }

  /** Turns a draft reference back into a displayable src, or null if its file is gone. */
  const restore = async (ref: string) => {
    if (!ref.startsWith(DRAFT_REF_PREFIX)) return ref

    const id = ref.slice(DRAFT_REF_PREFIX.length)
    for (const [previewUrl, entry] of staged) if (entry.id === id) return previewUrl

    const stored = await getStagedImage(id).catch(() => undefined)
    return stored ? track(stored.id, stored.params) : null
  }

  /** Deletes a day's stored images, except those `keepRefs` still point to. */
  const forgetDay = async (dayTimestamp: number, keepRefs: string[] = []) => {
    const keep = new Set(keepRefs)
    const stored = await getDayStagedImages(dayTimestamp).catch(() => [])
    await Promise.all(
      stored
        .filter((image) => !keep.has(`${DRAFT_REF_PREFIX}${image.id}`))
        .map((image) => deleteStagedImage(image.id).catch(() => {})),
    )
  }

  /** Uploads a staged file and returns its object key; anything else passes through unchanged. */
  const commit = async (src: string) => {
    const entry = staged.get(src)
    if (!entry) return src

    const objectKey = await uploadToStorage(entry.params)

    staged.delete(src)
    URL.revokeObjectURL(src)
    await deleteStagedImage(entry.id).catch(() => {})

    return objectKey
  }

  const release = () => {
    staged.forEach((_, previewUrl) => URL.revokeObjectURL(previewUrl))
    staged.clear()
  }

  onBeforeUnmount(release)

  return { stage, isStaged, draftRef, restore, forgetDay, commit, release }
}
