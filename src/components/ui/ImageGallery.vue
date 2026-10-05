<template>
  <div>
    <div v-if="images.length" class="flex flex-col gap-3 md:flex-row">
      <div class="relative min-w-0 flex-1 overflow-hidden rounded-xl py-6">
        <Transition name="backdrop-fade">
          <img
            v-if="urls[index]"
            :key="urls[index]!"
            :src="urls[index]!"
            alt=""
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
          />
        </Transition>

        <div
          class="mask-[linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
        >
          <div
            class="stage relative mx-auto aspect-square w-[70%] max-w-sm outline-none md:w-[55%]"
            :class="{ 'is-jumping': isJumping }"
            tabindex="0"
            role="group"
            aria-roledescription="carousel"
            :aria-label="`Image ${index + 1} of ${images.length}`"
            @keydown="onKeydown"
            @pointerdown="onPointerdown"
            @pointermove="onPointermove"
            @pointerup="onPointerup"
            @pointerleave="resetTilt"
            @pointercancel="onPointercancel"
          >
            <div
              v-for="(url, i) in urls"
              :key="i"
              class="slide absolute inset-0"
              :data-active="i === index || undefined"
              :style="slideStyle(i)"
              @click="onSlideClick(i)"
            >
              <img
                v-if="url"
                :ref="(el) => (slideImages[i] = el as HTMLImageElement | null)"
                :src="url"
                :alt="alt"
                draggable="false"
                class="h-full w-full rounded-2xl object-cover shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] select-none"
              />
              <div v-else class="h-full w-full animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>

        <template v-if="images.length > 1">
          <button
            v-show="index > 0"
            type="button"
            class="absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            aria-label="Previous image"
            @click="goTo(index - 1)"
          >
            <font-awesome-icon icon="chevron-left" />
          </button>
          <button
            v-show="index < images.length - 1"
            type="button"
            class="absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            aria-label="Next image"
            @click="goTo(index + 1)"
          >
            <font-awesome-icon icon="chevron-right" />
          </button>
        </template>
      </div>

      <div v-if="images.length > 1" class="relative shrink-0 md:w-14">
        <div
          ref="rail"
          class="relative flex gap-2.5 overflow-x-auto p-1.5 scrollbar-none md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto"
        >
          <button
            v-for="(url, i) in urls"
            :key="i"
            type="button"
            class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-110"
            :class="i === index ? 'ring-[3px] ring-white' : 'opacity-80 hover:opacity-100'"
            :aria-label="`Show image ${i + 1}`"
            :aria-current="i === index || undefined"
            @click="goTo(i)"
          >
            <img v-if="url" :src="url" alt="" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>
    </div>
    <div v-else class="py-4 text-center text-sm text-white/50">No images to display</div>

    <ImageLightbox v-model="lightboxSrc" :origin="() => slideImages[index] ?? null" :alt="alt" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import { useStorageResolve } from '@/composables'

const STEP_MS = 90
const SWIPE_DISTANCE = 40
const CLICK_SLOP = 6

const props = withDefaults(
  defineProps<{
    images: string[]
    alt?: string
    basePath?: string
  }>(),
  {
    images: () => [],
    alt: '',
    basePath: '',
  },
)

const { resolveStorageSrc } = useStorageResolve()
const reducedMotion = usePreferredReducedMotion()

const urls = ref<(string | null)[]>([])
const index = ref(0)
const isJumping = ref(false)
const tilt = ref({ x: 0, y: 0 })
const lightboxSrc = ref<string | null>(null)
const slideImages = ref<(HTMLImageElement | null)[]>([])
const rail = ref<HTMLElement | null>(null)

let stepTimer: number | undefined
let pointerStart: { x: number; y: number } | null = null
let suppressClick = false

const resolveUrl = async (path: string) => {
  try {
    return (await resolveStorageSrc(path)) ?? `${props.basePath}${path}`
  } catch {
    return null
  }
}

const slideStyle = (i: number) => {
  const offset = i - index.value
  return {
    '--offset': offset,
    '--dir': Math.sign(offset),
    '--tilt-x': tilt.value.x,
    '--tilt-y': tilt.value.y,
    zIndex: 10 - Math.abs(offset),
  }
}

const stopJump = () => {
  window.clearInterval(stepTimer)
  isJumping.value = false
}

// A far jump walks through every photo in between, so the flow never teleports.
const goTo = (target: number) => {
  const clamped = Math.max(0, Math.min(props.images.length - 1, target))
  stopJump()
  if (Math.abs(clamped - index.value) <= 1 || reducedMotion.value === 'reduce') {
    index.value = clamped
    return
  }
  isJumping.value = true
  const step = () => {
    index.value += Math.sign(clamped - index.value)
    if (index.value === clamped) stopJump()
  }
  step()
  stepTimer = window.setInterval(step, STEP_MS)
}

watch(
  () => props.images,
  async (images) => {
    stopJump()
    index.value = 0
    urls.value = images.map(() => null)
    const resolved = await Promise.all(images.map(resolveUrl))
    if (images === props.images) urls.value = resolved
  },
  { immediate: true },
)

const openLightbox = () => {
  const url = urls.value[index.value]
  if (!url) return
  resetTilt()
  lightboxSrc.value = url
}

const onSlideClick = (i: number) => {
  if (suppressClick) return
  if (i === index.value) openLightbox()
  else goTo(i)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') goTo(index.value - 1)
  else if (event.key === 'ArrowRight') goTo(index.value + 1)
  else if (event.key === 'Enter') openLightbox()
  else return
  event.preventDefault()
}

const onPointerdown = (event: PointerEvent) => {
  if (!event.isPrimary) return
  pointerStart = { x: event.clientX, y: event.clientY }
  suppressClick = false
}

const onPointermove = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || isJumping.value) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tilt.value = {
    x: (event.clientX - rect.left) / rect.width - 0.5,
    y: (event.clientY - rect.top) / rect.height - 0.5,
  }
}

const onPointerup = (event: PointerEvent) => {
  if (!pointerStart) return
  const dx = event.clientX - pointerStart.x
  const dy = event.clientY - pointerStart.y
  pointerStart = null
  suppressClick = Math.hypot(dx, dy) > CLICK_SLOP
  if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
    goTo(index.value + (dx < 0 ? 1 : -1))
  }
}

const onPointercancel = () => {
  pointerStart = null
}

const resetTilt = () => {
  tilt.value = { x: 0, y: 0 }
}

watch(index, async (i) => {
  await nextTick()
  const el = rail.value
  const item = el?.children[i] as HTMLElement | undefined
  if (!el || !item) return
  el.scrollTo({
    left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
    top: item.offsetTop - (el.clientHeight - item.offsetHeight) / 2,
    behavior: 'smooth',
  })
})

onUnmounted(stopJump)
</script>

<style scoped>
.stage {
  touch-action: pan-y;
}

.slide {
  cursor: pointer;
  filter: brightness(0.4);
  transform: perspective(1000px) translateX(calc(100% * var(--offset)))
    rotateY(calc(-45deg * var(--dir)));
  transition:
    transform 0.5s ease-in-out,
    filter 0.5s ease-in-out;
}

.slide[data-active] {
  cursor: zoom-in;
  filter: none;
  transform: perspective(1000px) rotateY(calc(var(--tilt-x) * 4deg))
    rotateX(calc(var(--tilt-y) * -4deg));
}

.stage:hover .slide[data-active] {
  transition-duration: 0.15s, 0.5s;
}

.stage.is-jumping .slide {
  transition-duration: 0.2s;
  transition-timing-function: linear;
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.5s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0 !important;
}

@media (prefers-reduced-motion: reduce) {
  .slide,
  .backdrop-fade-enter-active,
  .backdrop-fade-leave-active {
    transition-duration: 1ms;
  }
}
</style>
