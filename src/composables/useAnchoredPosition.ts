import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export interface AnchoredPositionOptions {
  /** Panel width in px, or 'anchor' to match the anchor element. */
  width?: number | 'anchor'
  minWidth?: number
  /** Preferred height; the panel shrinks below this when the viewport is tight. */
  maxHeight?: number
  /** Distance between the anchor and the panel. */
  gap?: number
  /** Distance kept between the panel and the viewport edges. */
  margin?: number
}

const MIN_HEIGHT = 120

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

/**
 * Positions a fixed, teleported panel against an anchor element, clamped to the
 * visible viewport and flipped above the anchor when it does not fit below.
 */
export function useAnchoredPosition(
  getAnchor: () => HTMLElement | null | undefined,
  options: AnchoredPositionOptions | (() => AnchoredPositionOptions) = {},
) {
  const style = ref<Record<string, string>>({})

  const updatePosition = () => {
    const anchor = getAnchor()
    if (!anchor) return

    const {
      width = 'anchor',
      minWidth = 0,
      maxHeight = 200,
      gap = 4,
      margin = 8,
    } = typeof options === 'function' ? options() : options

    const rect = anchor.getBoundingClientRect()

    // The software keyboard shrinks the visual viewport only; window stays the layout size.
    const vv = window.visualViewport
    const viewLeft = vv?.offsetLeft ?? 0
    const viewTop = vv?.offsetTop ?? 0
    const viewWidth = vv?.width ?? window.innerWidth
    const viewHeight = vv?.height ?? window.innerHeight

    const requested = width === 'anchor' ? rect.width : width
    const panelWidth = clamp(Math.max(requested, minWidth), 0, viewWidth - margin * 2)
    const left = clamp(rect.left, viewLeft + margin, viewLeft + viewWidth - panelWidth - margin)

    const spaceBelow = viewTop + viewHeight - rect.bottom - gap - margin
    const spaceAbove = rect.top - viewTop - gap - margin
    const openAbove = spaceBelow < maxHeight && spaceAbove > spaceBelow
    const panelHeight = Math.max(
      Math.min(maxHeight, openAbove ? spaceAbove : spaceBelow),
      MIN_HEIGHT,
    )

    style.value = {
      position: 'fixed',
      left: `${Math.round(left)}px`,
      width: `${Math.round(panelWidth)}px`,
      maxHeight: `${Math.round(panelHeight)}px`,
      // `bottom` resolves against the layout viewport, so it cannot reuse viewTop/viewHeight.
      ...(openAbove
        ? { bottom: `${Math.round(document.documentElement.clientHeight - rect.top + gap)}px` }
        : { top: `${Math.round(rect.bottom + gap)}px` }),
    }
  }

  useEventListener(window, 'resize', updatePosition)
  useEventListener(window, 'scroll', updatePosition, { capture: true })
  useEventListener(window.visualViewport, ['resize', 'scroll'], updatePosition)

  return { style, updatePosition }
}
