let pendingResolve: (() => void) | null = null
let pendingTimer: ReturnType<typeof setTimeout> | null = null
let readyEarly = false

const settle = () => {
  if (pendingTimer) clearTimeout(pendingTimer)
  pendingTimer = null
  const resolve = pendingResolve
  pendingResolve = null
  resolve?.()
}

export const markScrollReady = () => {
  if (pendingResolve) settle()
  else readyEarly = true
}

export const resetScrollReady = () => {
  readyEarly = false
  settle()
}

export const waitForScrollReady = (timeoutMs = 600): Promise<void> => {
  if (readyEarly) {
    readyEarly = false
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    pendingResolve = resolve
    pendingTimer = setTimeout(settle, timeoutMs)
  })
}
