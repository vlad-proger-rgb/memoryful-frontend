<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * A single background image/video and its blurred placeholder. Owns its own load
 * state so that while `MediaBackground` cross-fades two of these, the outgoing
 * one isn't reset by the incoming one's load events.
 */
const props = withDefaults(
  defineProps<{
    src: string
    isVideo?: boolean
    posterUrl?: string | null
    placeholder?: string | null
  }>(),
  { isVideo: false, posterUrl: null, placeholder: null },
)

const layer = 'absolute inset-0 w-full h-full object-cover'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Reduced motion prefers the poster still, which also skips the video download.
// Without a poster we mount the video anyway but leave it paused, so its first
// frame stands in rather than showing only the placeholder.
const useStillForVideo = computed(
  () => props.isVideo && prefersReducedMotion && Boolean(props.posterUrl),
)
const showVideo = computed(() => props.isVideo && !useStillForVideo.value)
const animateVideo = computed(() => showVideo.value && !prefersReducedMotion)

const imageSrc = computed(() => {
  if (!props.isVideo) return props.src
  return useStillForVideo.value ? props.posterUrl : null
})

const mediaReady = ref(false)
const posterReady = ref(false)
</script>

<template>
  <div class="absolute inset-0">
    <div
      v-if="placeholder"
      class="absolute inset-0 bg-center bg-cover scale-110 blur-2xl"
      :style="{ backgroundImage: `url(${placeholder})` }"
    />

    <img
      v-if="showVideo && posterUrl"
      :src="posterUrl"
      :class="[layer, 'transition-opacity duration-500', posterReady ? 'opacity-100' : 'opacity-0']"
      alt=""
      decoding="async"
      fetchpriority="high"
      @load="posterReady = true"
    />

    <video
      v-if="showVideo"
      :src="src"
      :class="[layer, 'transition-opacity duration-700', mediaReady ? 'opacity-100' : 'opacity-0']"
      :autoplay="animateVideo"
      :loop="animateVideo"
      muted
      playsinline
      preload="metadata"
      @canplay="mediaReady = true"
    />
    <img
      v-else-if="imageSrc"
      :src="imageSrc"
      :class="[layer, 'transition-opacity duration-500', mediaReady ? 'opacity-100' : 'opacity-0']"
      alt=""
      decoding="async"
      fetchpriority="high"
      @load="mediaReady = true"
    />
  </div>
</template>
