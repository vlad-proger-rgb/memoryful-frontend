import { computed, ref, watch, type CSSProperties } from 'vue'

const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 0.5 // px per ms, a flick
const SETTLE_MS = 200
// A finger held still before letting go is a drop, not a flick, however fast it moved.
const FLICK_WINDOW_MS = 100
// The sheet is already as tall as it gets, so upward travel only gives a little.
const UPWARD_RESISTANCE = 5

export interface DragToDismissOptions {
  isOpen: () => boolean
  onDismiss: () => void
  enabled?: () => boolean
}

/**
 * Lets a bottom sheet be dragged down by its handle and dismissed past a distance or with a flick.
 *
 * Bind `handlers` on the handle, which needs `touch-action: none` or the browser claims the
 * gesture as a scroll, and `style` on the sheet. The offset is a `transform`, so the sheet's
 * enter/leave must animate `translate` — as Tailwind's utilities do — or the two overwrite
 * each other.
 */
export function useDragToDismiss({
  isOpen,
  onDismiss,
  enabled = () => true,
}: DragToDismissOptions) {
  const offset = ref(0)
  const isSettling = ref(false)

  let isDragging = false
  let startY = 0
  let lastY = 0
  let lastTime = 0
  let velocity = 0
  let settleTimer: number | undefined

  const settle = () => {
    isSettling.value = true
    offset.value = 0
    window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(() => (isSettling.value = false), SETTLE_MS)
  }

  const onPointerdown = (event: PointerEvent) => {
    if (!event.isPrimary || !enabled()) return
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) return
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    isDragging = true
    isSettling.value = false
    startY = lastY = event.clientY
    lastTime = event.timeStamp
    velocity = 0
  }

  const onPointermove = (event: PointerEvent) => {
    if (!isDragging) return
    const delta = event.clientY - startY
    offset.value = delta > 0 ? delta : delta / UPWARD_RESISTANCE
    velocity = (event.clientY - lastY) / Math.max(1, event.timeStamp - lastTime)
    lastY = event.clientY
    lastTime = event.timeStamp
  }

  const onPointerup = (event: PointerEvent) => {
    if (!isDragging) return
    isDragging = false
    const flicked =
      event.type === 'pointerup' &&
      offset.value > 0 &&
      velocity > DISMISS_VELOCITY &&
      event.timeStamp - lastTime < FLICK_WINDOW_MS
    if (offset.value > DISMISS_DISTANCE || flicked) {
      // The offset stays, so the sheet leaves from where the finger let go.
      onDismiss()
    } else if (offset.value !== 0) {
      settle()
    }
  }

  watch(isOpen, (open) => {
    isDragging = false
    isSettling.value = false
    window.clearTimeout(settleTimer)
    if (open) offset.value = 0
  })

  const style = computed<CSSProperties | undefined>(() => {
    if (isSettling.value) {
      return { transform: 'translateY(0)', transition: `transform ${SETTLE_MS}ms ease-out` }
    }
    return offset.value ? { transform: `translateY(${offset.value}px)` } : undefined
  })

  return {
    style,
    handlers: {
      pointerdown: onPointerdown,
      pointermove: onPointermove,
      pointerup: onPointerup,
      pointercancel: onPointerup,
    },
  }
}
