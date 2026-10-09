import { openDB, type DBSchema } from 'idb'

import type { UploadToStorageParams } from '@/composables/useStorageUpload'

/** A picked image that hasn't been uploaded yet, kept so it survives a reload. */
export interface StoredStagedImage {
  id: string
  dayTimestamp: number
  params: UploadToStorageParams
}

interface StagedImagesDB extends DBSchema {
  'staged-images': {
    key: string
    value: StoredStagedImage
    indexes: { dayTimestamp: number }
  }
}

let dbPromise: ReturnType<typeof openDB<StagedImagesDB>> | null = null

const db = () =>
  (dbPromise ??= openDB<StagedImagesDB>('memoryful', 1, {
    upgrade(database) {
      database
        .createObjectStore('staged-images', { keyPath: 'id' })
        .createIndex('dayTimestamp', 'dayTimestamp')
    },
  }))

export const putStagedImage = async (image: StoredStagedImage) =>
  (await db()).put('staged-images', image)

export const getStagedImage = async (id: string) => (await db()).get('staged-images', id)

export const getDayStagedImages = async (dayTimestamp: number) =>
  (await db()).getAllFromIndex('staged-images', 'dayTimestamp', dayTimestamp)

export const deleteStagedImage = async (id: string) => (await db()).delete('staged-images', id)
