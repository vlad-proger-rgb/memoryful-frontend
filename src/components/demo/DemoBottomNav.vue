<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AiOrbButton from '@/components/ai/AiOrbButton.vue'
import DemoDashboardIcon from '@/components/demo/DemoDashboardIcon.vue'
import { navDestinations } from '@/config/navigation'

defineOptions({
  name: 'DemoBottomNav',
})

const route = useRoute()

const settings = navDestinations.find((d) => d.key === 'settings')!

const isDashboard = computed(() => route.path.startsWith('/demo/dashboard'))
const isSettings = computed(() => route.path.startsWith(settings.to))
</script>

<template>
  <nav class="bottom-nav" aria-label="Primary">
    <div class="glass-pill">
      <RouterLink
        to="/demo/dashboard"
        class="bottom-nav-item"
        :class="{ 'is-active': isDashboard }"
        aria-label="Dashboard"
        :aria-current="isDashboard ? 'page' : undefined"
      >
        <DemoDashboardIcon class="text-xl" />
      </RouterLink>

      <div class="bottom-nav-orb-slot">
        <!-- No outer ring here: at phone size it crowded the cards behind the bar. -->
        <AiOrbButton :size="48" :ring-spread="1.42" class="bottom-nav-orb" />
      </div>

      <RouterLink
        :to="settings.to"
        class="bottom-nav-item"
        :class="{ 'is-active': isSettings }"
        :aria-label="settings.label"
        :aria-current="isSettings ? 'page' : undefined"
      >
        <font-awesome-icon :icon="settings.icon" class="text-xl" />
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
  /* Deliberately no `display` here — App.vue's `md:hidden` decides the breakpoint. */
}

/* Same liquid glass as the shared bar, with two destinations instead of four. */
.glass-pill {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  max-width: 340px;
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

.bottom-nav-item:active {
  transform: scale(0.92);
}

.bottom-nav-orb-slot {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 96px;
}

/* Raised out of the capsule so the orb reads as the primary action rather than a third tab.
   width:max-content is load-bearing — shrink-to-fit against `left:50%` would otherwise cap
   the button at half the slot and squash the logo via preflight's img{max-width:100%}. */
.bottom-nav-orb {
  position: absolute;
  left: 50%;
  bottom: 14px;
  width: max-content;
  transform: translateX(-50%);
}

.bottom-nav-orb::after {
  content: '';
  position: absolute;
  z-index: 0;
  inset: -6px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(14, 14, 20, 0.72) 40%, rgba(14, 14, 20, 0) 72%);
}

@media (prefers-reduced-motion: reduce) {
  .bottom-nav-item {
    transition: none;
  }
}
</style>
