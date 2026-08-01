const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.avi']

/** Whether a filename or storage key points at something to render with <video>. */
export function isVideoPath(path: string): boolean {
  const lower = path.toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || isVideoPath(file.name)
}
