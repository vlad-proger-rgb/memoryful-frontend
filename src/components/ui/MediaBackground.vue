<script setup lang="ts">
import { ref, watch } from 'vue'

import MediaBackgroundLayer from './MediaBackgroundLayer.vue'

const props = withDefaults(
  defineProps<{
    src: string | null
    isVideo?: boolean
    posterUrl?: string | null
    placeholder?: string | null
    /** Positioning, stacking and filters, e.g. `fixed inset-0 z-0 brightness-75`. */
    containerClass?: string
  }>(),
  {
    isVideo: false,
    posterUrl: null,
    placeholder: null,
    containerClass: 'fixed inset-0 -z-10',
  },
)

interface Layer {
  src: string
  isVideo: boolean
  posterUrl: string | null
  placeholder: string | null
}

const shown = ref<Layer | null>(null)

// Long enough for an already-cached image to decode, so revisiting a background
// cross-fades sharp-to-sharp; past it we swap anyway and let the new layer's
// blur cover the wait rather than holding the old background on screen.
const DECODE_GRACE_MS = 300

let latest = 0

function preload(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function raceGrace(work: Promise<void>, ms: number): Promise<void> {
  return Promise.race([work, new Promise<void>((resolve) => setTimeout(resolve, ms))])
}

watch(
  () => [props.src, props.isVideo, props.posterUrl, props.placeholder] as const,
  async ([src, isVideo, posterUrl, placeholder]) => {
    const token = ++latest

    if (!src) {
      shown.value = null
      return
    }

    const next: Layer = {
      src,
      isVideo: Boolean(isVideo),
      posterUrl: posterUrl ?? null,
      placeholder: placeholder ?? null,
    }

    // Nothing to hold on screen on first paint, and preloading video is too
    // expensive to block a swap on.
    if (shown.value && !next.isVideo) {
      await raceGrace(preload(src), DECODE_GRACE_MS)
      if (token !== latest) return
    }

    shown.value = next
  },
  { immediate: true },
)
</script>

<template>
  <div :class="containerClass" aria-hidden="true">
    <div class="absolute inset-0 bg-[#0b1120]" />

    <!-- Two layers, because a reused <img> keeps painting its old bitmap until
         the new src decodes — fading one element can only dip and pop back, it
         can never fade between two images. -->
    <Transition name="media-bg">
      <MediaBackgroundLayer
        v-if="shown"
        :key="shown.src"
        :src="shown.src"
        :is-video="shown.isVideo"
        :poster-url="shown.posterUrl"
        :placeholder="shown.placeholder"
      />
    </Transition>
  </div>
</template>

<style scoped>
.media-bg-enter-active,
.media-bg-leave-active {
  transition: opacity 600ms ease;
}

.media-bg-enter-from,
.media-bg-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .media-bg-enter-active,
  .media-bg-leave-active {
    transition-duration: 1ms;
  }
}
</style>
