<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AiOrbButton from '@/components/ai/AiOrbButton.vue'
import { isDestinationActive, navDestinations, type NavDestination } from '@/config/navigation'
import useFeatureFlagsStore from '@/stores/featureFlags'

defineOptions({
  name: 'BottomNav',
})

const route = useRoute()
const featureFlags = useFeatureFlagsStore()

// Two on each side of the raised centre orb.
const leftDestinations = computed(() => navDestinations.slice(0, 2))
const rightDestinations = computed(() => navDestinations.slice(2))

const isActive = (to: string) =>
  isDestinationActive(navDestinations.find((d) => d.to === to)!, route.path)

const iconColors = computed(() => featureFlags.isEnabled('navIconColors'))
const iconStyle = (destination: NavDestination) =>
  iconColors.value ? { color: destination.color } : undefined

const pillRef = ref<HTMLElement | null>(null)
const lensStyle = ref<Record<string, string>>({ opacity: '0' })

// Keeps the lens off the capsule's rounded ends, which it would otherwise sit tangent to.
const LENS_INSET = 4

/** The lens tracks whichever tab is current; the orb slot makes the offsets uneven, so
 *  measure rather than compute them from an index. */
const positionLens = () => {
  const pill = pillRef.value
  const active = pill?.querySelector<HTMLElement>('a[aria-current="page"]')
  if (!pill || !active) {
    lensStyle.value = { opacity: '0' }
    return
  }

  lensStyle.value = {
    opacity: '1',
    width: `${active.offsetWidth - LENS_INSET * 2}px`,
    transform: `translateX(${active.offsetLeft + LENS_INSET}px)`,
  }
}

let observer: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  positionLens()
  observer = new ResizeObserver(positionLens)
  if (pillRef.value) observer.observe(pillRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch(
  () => route.path,
  async () => {
    await nextTick()
    positionLens()
  },
)
</script>

<template>
  <nav class="bottom-nav" aria-label="Primary">
    <div ref="pillRef" class="glass-pill">
      <span class="lens" :style="lensStyle" aria-hidden="true" />

      <RouterLink
        v-for="destination in leftDestinations"
        :key="destination.key"
        :to="destination.to"
        class="bottom-nav-item"
        :class="{ 'is-active': isActive(destination.to), 'has-color': iconColors }"
        :style="iconStyle(destination)"
        :aria-label="destination.label"
        :aria-current="isActive(destination.to) ? 'page' : undefined"
      >
        <font-awesome-icon :icon="destination.icon" class="text-xl" />
      </RouterLink>

      <div class="bottom-nav-orb-slot">
        <AiOrbButton :size="52" :ring-spread="1.42" class="bottom-nav-orb" />
      </div>

      <RouterLink
        v-for="destination in rightDestinations"
        :key="destination.key"
        :to="destination.to"
        class="bottom-nav-item"
        :class="{ 'is-active': isActive(destination.to), 'has-color': iconColors }"
        :style="iconStyle(destination)"
        :aria-label="destination.label"
        :aria-current="isActive(destination.to) ? 'page' : undefined"
      >
        <font-awesome-icon :icon="destination.icon" class="text-xl" />
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  padding: 0 12px calc(var(--bottom-nav-gap) + env(safe-area-inset-bottom, 0px));
  /* The bar floats, so only the capsule itself should intercept taps. */
  pointer-events: none;
  /* Deliberately no `display` here — App.vue's `md:hidden` is the single place the
     breakpoint is decided, and a scoped class would outrank that utility. */
}

/* Liquid glass: a dark tinted capsule that refracts the page behind it, lit along the
   top edge so it reads as a physical pane rather than a flat translucent box. */
.glass-pill {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
  height: var(--bottom-nav-height);
  border-radius: 9999px;
  color: white;
  background: rgba(20, 20, 26, 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 10px 34px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.34),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

/* Specular sheen down the upper half — the highlight a curved glass edge would catch. */
.glass-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0.04) 44%,
    rgba(255, 255, 255, 0) 62%
  );
  pointer-events: none;
}

/* The travelling highlight behind the current tab. Its own inner rim makes it read as a
   thicker lens sitting inside the capsule, which is what sells the depth. */
.lens {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: 0;
  width: 0;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    0 2px 10px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition:
    transform 460ms cubic-bezier(0.22, 1, 0.36, 1),
    width 460ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 200ms ease;
}

.bottom-nav-item {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  color: rgba(255, 255, 255, 0.6);
  transition:
    color 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.bottom-nav-item.is-active {
  color: white;
  transform: translateY(-1px) scale(1.08);
}

/* Tinted mode drives color from the inline style, so dim the inactive icons with opacity
   rather than the white-mode color ramp. */
.bottom-nav-item.has-color {
  opacity: 0.7;
}

.bottom-nav-item.has-color.is-active {
  opacity: 1;
}

.bottom-nav-item:active {
  transform: scale(0.92);
}

.bottom-nav-orb-slot {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 84px;
}

/* Raised out of the capsule so the orb reads as the primary action rather than a fifth tab.
   width:max-content is load-bearing — shrink-to-fit against `left:50%` would otherwise cap
   the button at half the slot and squash the logo via preflight's img{max-width:100%}. */
.bottom-nav-orb {
  position: absolute;
  left: 50%;
  bottom: 24px;
  width: max-content;
  transform: translateX(-50%);
}

/* Just enough shading to keep the overhanging top of the orb legible against page content,
   without stamping an opaque hole through the glass behind it. */
.bottom-nav-orb::after {
  content: '';
  position: absolute;
  z-index: 0;
  inset: -6px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(14, 14, 20, 0.72) 46%, rgba(14, 14, 20, 0) 76%);
}

@media (prefers-reduced-motion: reduce) {
  .lens,
  .bottom-nav-item {
    transition: none;
  }
}
</style>
