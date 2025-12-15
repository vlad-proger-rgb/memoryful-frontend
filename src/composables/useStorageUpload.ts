import storageApi, { type PresignPutRequest, type StorageUploadIntent } from '@/api/storage'

export interface UploadToStorageParams {
  file: File
  intent: StorageUploadIntent
  dayTimestamp?: number
  year?: number
  month?: number
  workspacePageKey?: string
}

export function useStorageUpload() {
  const uploadToStorage = async (params: UploadToStorageParams): Promise<string> => {
    const { file, intent, dayTimestamp, year, month, workspacePageKey } = params

    let presign
    try {
      const body: PresignPutRequest = {
        intent,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      }

      if (dayTimestamp !== undefined) body.dayTimestamp = dayTimestamp
      if (year !== undefined) body.year = year
      if (month !== undefined) body.month = month
      if (workspacePageKey !== undefined) body.workspacePageKey = workspacePageKey

      presign = await storageApi.presignPut(body)
    } catch (e) {
      console.error('presignPut failed:', e)
      throw new Error('Presign request failed')
    }

    if (!presign.data?.uploadUrl || !presign.data?.objectKey) {
      console.error('Invalid presign response:', presign)
      throw new Error('Failed to get upload URL')
    }

    const uploadRes = await fetch(presign.data.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!uploadRes.ok) {
      const bodyText = await uploadRes.text().catch(() => '')
      console.error('Upload failed:', {
        status: uploadRes.status,
        statusText: uploadRes.statusText,
        bodyText,
      })
      throw new Error(`Upload failed (${uploadRes.status}) ${bodyText || uploadRes.statusText}`)
    }

    return presign.data.objectKey
  }

  return { uploadToStorage }
}
