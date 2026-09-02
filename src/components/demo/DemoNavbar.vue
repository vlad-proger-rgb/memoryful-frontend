<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AiOrbButton from '@/components/ai/AiOrbButton.vue'
import DemoDashboardIcon from '@/components/demo/DemoDashboardIcon.vue'
import { navDestinations } from '@/config/navigation'

defineOptions({
  name: 'DemoNavbar',
})

const settings = navDestinations.find((d) => d.key === 'settings')!

// How far the rings lean toward the pointer, in px at the edge of the orb.
const TILT = 6
// How much the ring set stretches toward the side the pointer is on.
const LEAN = 0.16

const orbSlot = ref<HTMLElement | null>(null)

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

const aim = ref({ x: 0, y: 0 })

const orbStyle = computed(() => {
  const { x: nx, y: ny } = aim.value

  return {
    '--tilt-x': `${nx * TILT}px`,
    '--tilt-y': `${ny * TILT}px`,
    // Pinning the origin to the far side turns the scale into a stretch *toward* the
    // pointer rather than an even growth in both directions.
    '--ring-origin-x': `${50 - nx * 50}%`,
    '--ring-scale-x': 1 + Math.abs(nx) * LEAN,
  }
})

const trackPointer = (event: MouseEvent) => {
  const box = orbSlot.value?.getBoundingClientRect()
  if (!box) return

  aim.value = {
    x: clamp((event.clientX - (box.left + box.width / 2)) / (box.width / 2)),
    y: clamp((event.clientY - (box.top + box.height / 2)) / (box.height / 2)),
  }
}

const resetPointer = () => {
  aim.value = { x: 0, y: 0 }
}
</script>

<template>
  <nav
    class="h-[var(--app-header-height)] items-center justify-center gap-[clamp(3rem,9vw,8rem)] bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,1)_100%)] text-white backdrop-blur-sm"
  >
    <RouterLink to="/demo/dashboard" class="header-link">
      <DemoDashboardIcon class="text-2xl" />
      <span>Dashboard</span>
    </RouterLink>

    <!-- The rings lean toward the cursor, so the orb reads as noticing where you are. -->
    <div
      ref="orbSlot"
      class="orb-slot"
      :style="orbStyle"
      @mousemove="trackPointer"
      @mouseleave="resetPointer"
    >
      <!-- The outer set reaches ~20px past the inner one to each side, but stays bar-height
           so the top of the window never clips it. -->
      <AiOrbButton
        :size="52"
        :ring-spread="1.28"
        :outer-ring-spread="2.05"
        :outer-ring-height-spread="1.3"
      />
    </div>

    <RouterLink :to="settings.to" class="header-link">
      <font-awesome-icon :icon="settings.icon" class="text-2xl" />
      <span>Settings</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.header-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.15s ease;
}

.header-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.header-link.router-link-active {
  color: #fff;
}

.orb-slot {
  position: relative;
  display: grid;
  place-items: center;
  line-height: 0;
}

/* The rings lean toward the pointer and stretch out on that side, so the halo reads as
   noticing where you are rather than just sliding around. */
.orb-slot :deep(.orbit-rings) {
  transform-origin: var(--ring-origin-x, 50%) center;
  transform: translate(calc(-50% + var(--tilt-x)), calc(-50% + var(--tilt-y)))
    scaleX(var(--ring-scale-x, 1));
  transition:
    transform 0.25s ease-out,
    opacity 0.4s ease;
}

.orb-slot :deep(.orbit-rings-outer) {
  /* Further out, so it swings and stretches a little wider than the inner set. */
  transform: translate(calc(-50% + var(--tilt-x) * 1.6), calc(-50% + var(--tilt-y) * 1.6))
    scaleX(calc(var(--ring-scale-x, 1) * 1.05));
}

.orb-slot :deep(.ai-logo-orbit:hover .orbit-rings) {
  transform: translate(calc(-50% + var(--tilt-x)), calc(-50% + var(--tilt-y)))
    scaleX(calc(var(--ring-scale-x, 1) * 1.2));
}

.orb-slot :deep(.ai-logo-orbit:hover .orbit-rings-outer) {
  transform: translate(calc(-50% + var(--tilt-x) * 1.6), calc(-50% + var(--tilt-y) * 1.6))
    scaleX(calc(var(--ring-scale-x, 1) * 1.12));
}

@media (prefers-reduced-motion: reduce) {
  .orb-slot :deep(.orbit-rings) {
    transition: none;
  }
}
</style>
