<template>
  <Teleport to="body">
    <div
      v-if="src"
      class="fixed inset-0 z-60 touch-none select-none"
      @wheel.prevent
      @pointerdown="onPointerdown"
      @pointermove="onPointermove"
      @pointerup="onPointerup"
      @pointercancel="onPointerup"
    >
      <div
        class="absolute inset-0 bg-black transition-opacity ease-out"
        :style="{ opacity: backdropOpacity, transitionDuration: `${ZOOM_MS}ms` }"
      />
      <img
        :src="src"
        :alt="alt"
        draggable="false"
        class="lightbox-image fixed object-cover"
        :class="{ 'is-animating': isAnimating }"
        :style="imageStyle"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

const ZOOM_MS = 320
const DISMISS_DISTANCE = 100
const TAP_SLOP = 8
const VIEWPORT_MARGIN = 16

const props = defineProps<{
  /** The thumbnail the image zooms out of, and back into on close. */
  origin: () => HTMLImageElement | null
  alt?: string
}>()

const src = defineModel<string | null>({ default: null })

interface Box {
  left: number
  top: number
  width: number
  height: number
}

const box = ref<Box | null>(null)
const isOpen = ref(false)
const isAnimating = ref(false)
const dragY = ref(0)

let startY: number | null = null
let closeTimer: number | undefined

const originBox = (): Box | null => {
  const el = props.origin()
  if (!el) return null
  const { left, top, width, height } = el.getBoundingClientRect()
  return { left, top, width, height }
}

// Matching the image's own aspect makes `object-cover` show the whole photo, so the
// square thumbnail crop opens up into the full frame as the box grows.
const fittedBox = (): Box => {
  const el = props.origin()
  const ratio = el?.naturalWidth && el.naturalHeight ? el.naturalWidth / el.naturalHeight : 1
  const maxW = window.innerWidth - VIEWPORT_MARGIN * 2
  const maxH = window.innerHeight - VIEWPORT_MARGIN * 2
  const width = Math.min(maxW, maxH * ratio)
  const height = width / ratio
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  }
}

const animateTo = (next: Box | null, done?: () => void) => {
  isAnimating.value = true
  box.value = next
  window.clearTimeout(closeTimer)
  closeTimer = window.setTimeout(() => {
    isAnimating.value = false
    done?.()
  }, ZOOM_MS)
}

const open = () => {
  box.value = originBox() ?? fittedBox()
  isOpen.value = true
  dragY.value = 0
  // Two frames: one to mount at the origin, one to paint it, so the zoom starts from there.
  requestAnimationFrame(() => requestAnimationFrame(() => animateTo(fittedBox())))
}

const close = () => {
  if (!isOpen.value) return
  isOpen.value = false
  dragY.value = 0
  animateTo(originBox(), () => (src.value = null))
}

watch(src, (next, prev) => {
  if (next && !prev) open()
})

const backdropOpacity = computed(() => {
  if (!isOpen.value) return 0
  return Math.max(0.3, 1 - Math.abs(dragY.value) / (DISMISS_DISTANCE * 3))
})

const imageStyle = computed(() => {
  const b = box.value
  if (!b) return { display: 'none' }
  return {
    left: `${b.left}px`,
    top: `${b.top}px`,
    width: `${b.width}px`,
    height: `${b.height}px`,
    transform: dragY.value ? `translateY(${dragY.value}px)` : undefined,
    transitionDuration: `${ZOOM_MS}ms`,
  }
})

const onPointerdown = (event: PointerEvent) => {
  if (!event.isPrimary || !isOpen.value) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  startY = event.clientY
}

const onPointermove = (event: PointerEvent) => {
  if (startY === null) return
  dragY.value = event.clientY - startY
}

const onPointerup = () => {
  if (startY === null) return
  startY = null
  const moved = Math.abs(dragY.value)
  if (moved < TAP_SLOP || moved > DISMISS_DISTANCE) close()
  else dragY.value = 0
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    // DayView's edit modal listens for Escape on the same window.
    event.stopImmediatePropagation()
    close()
  }
}

watch(isOpen, (value) => {
  if (value) window.addEventListener('keydown', onKeydown, { capture: true })
  else window.removeEventListener('keydown', onKeydown, { capture: true })
})

onUnmounted(() => {
  window.clearTimeout(closeTimer)
  window.removeEventListener('keydown', onKeydown, { capture: true })
})
</script>

<style scoped>
.lightbox-image.is-animating {
  transition-property: left, top, width, height, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .lightbox-image.is-animating {
    transition-duration: 1ms !important;
  }
}
</style>
