import { isVideoFile } from '@/utils/media'

const TARGET_WIDTH = 32
const QUALITY = 0.55
const TIMEOUT_MS = 5000

function toDataUrl(source: HTMLImageElement | HTMLVideoElement, width: number, height: number) {
  if (!width || !height) return null

  const canvas = document.createElement('canvas')
  canvas.width = TARGET_WIDTH
  canvas.height = Math.max(1, Math.round(height * (TARGET_WIDTH / width)))

  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/webp', QUALITY)
}

function fromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    const done = (result: string | null) => {
      URL.revokeObjectURL(url)
      resolve(result)
    }

    img.onload = () => done(toDataUrl(img, img.naturalWidth, img.naturalHeight))
    img.onerror = () => done(null)
    img.src = url
  })
}

function fromVideo(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')

    const done = (result: string | null) => {
      URL.revokeObjectURL(url)
      resolve(result)
    }

    video.onerror = () => done(null)
    // Draw on `seeked`, not `loadeddata`: the first frame isn't necessarily
    // painted yet at loadeddata, and seeking to exactly 0 is a no-op that would
    // never fire `seeked` at all.
    video.onseeked = () => done(toDataUrl(video, video.videoWidth, video.videoHeight))
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.1, video.duration || 0.1)
    }

    video.muted = true
    video.preload = 'auto'
    video.src = url
  })
}

// A file that decodes to neither success nor error would otherwise hang the
// upload waiting on an event that never arrives.
function withTimeout(work: Promise<string | null>): Promise<string | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), TIMEOUT_MS)
    const settle = (result: string | null) => {
      clearTimeout(timer)
      resolve(result)
    }
    work.then(settle, () => settle(null))
  })
}

export function useMediaPlaceholder() {
  /** A ~32px WebP `data:` URI for `file`, or null if one couldn't be produced. */
  const generatePlaceholder = async (file: File): Promise<string | null> => {
    try {
      return await withTimeout(isVideoFile(file) ? fromVideo(file) : fromImage(file))
    } catch (e) {
      console.warn('Could not generate media placeholder:', e)
      return null
    }
  }

  return { generatePlaceholder }
}

export default useMediaPlaceholder
