<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AiOrbButton from '@/components/ai/AiOrbButton.vue'
import DashboardIcon from '@/components/ui/DashboardIcon.vue'
import { useAdjacentDays } from '@/composables'
import { isDestinationActive, navDestinations } from '@/config/navigation'
import useFeatureFlagsStore from '@/stores/featureFlags'

defineOptions({
  name: 'BottomNav',
})

const route = useRoute()
const router = useRouter()
const featureFlags = useFeatureFlagsStore()

const dashboard = navDestinations.find((d) => d.key === 'dashboard')!
const settings = navDestinations.find((d) => d.key === 'settings')!

const iconColors = computed(() => featureFlags.isEnabled('navIconColors'))
const iconStyle = (color: string) => (iconColors.value ? { color } : undefined)

const isDashboard = computed(() => isDestinationActive(dashboard, route.path))
const isSettings = computed(() => isDestinationActive(settings, route.path))

const { isDayRoute, steps: daySteps } = useAdjacentDays()
</script>

<template>
  <nav class="bottom-nav" :class="{ 'is-day': isDayRoute }" aria-label="Primary">
    <div class="bottom-nav-row">
      <button
        v-for="step in daySteps"
        :key="step.key"
        type="button"
        class="day-step"
        :class="`day-step-${step.key}`"
        :disabled="!step.to"
        :inert="!isDayRoute"
        :aria-label="step.label"
        @click="step.to && router.push(step.to)"
      >
        <font-awesome-icon :icon="step.icon" class="text-lg" />
      </button>

      <div class="glass-pill">
        <RouterLink
          :to="dashboard.to"
          class="bottom-nav-item"
          :class="{ 'is-active': isDashboard, 'has-color': iconColors }"
          :style="iconStyle(dashboard.color)"
          :aria-label="dashboard.label"
          :aria-current="isDashboard ? 'page' : undefined"
        >
          <DashboardIcon class="text-xl" />
        </RouterLink>

        <div class="bottom-nav-orb-slot">
          <!-- No outer ring here: at phone size it crowded the cards behind the bar. -->
          <AiOrbButton :size="48" :ring-spread="1.42" class="bottom-nav-orb" />
        </div>

        <RouterLink
          :to="settings.to"
          class="bottom-nav-item"
          :class="{ 'is-active': isSettings, 'has-color': iconColors }"
          :style="iconStyle(settings.color)"
          :aria-label="settings.label"
          :aria-current="isSettings ? 'page' : undefined"
        >
          <font-awesome-icon :icon="settings.icon" class="text-xl" />
        </RouterLink>
      </div>
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

/* On a day the row widens by the two arrows, so the pill only shrinks where the screen is too narrow. */
.bottom-nav-row {
  --day-step-size: 48px;
  --day-step-room: calc(var(--day-step-size) + 8px);
  position: relative;
  max-width: 340px;
  margin-inline: auto;
  transition: max-width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.is-day .bottom-nav-row {
  max-width: calc(340px + 2 * var(--day-step-room));
}

/* Same liquid glass as the shared bar, with two destinations instead of four. */
.glass-pill {
  pointer-events: auto;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  margin-inline: 0;
  transition: margin-inline 0.45s cubic-bezier(0.22, 1, 0.36, 1);
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

.is-day .glass-pill {
  margin-inline: var(--day-step-room);
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

/* Tucked under the pill until a day opens, then slide out to either side of it. */
.day-step {
  pointer-events: none;
  position: absolute;
  z-index: 0;
  top: calc((var(--bottom-nav-height) - var(--day-step-size)) / 2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--day-step-size);
  height: var(--day-step-size);
  border-radius: 9999px;
  color: white;
  background: rgba(20, 20, 26, 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  opacity: 0;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease,
    color 0.25s ease;
}

.day-step-previous {
  left: 0;
  transform: translateX(var(--day-step-room)) scale(0.6);
}

.day-step-next {
  right: 0;
  transform: translateX(calc(-1 * var(--day-step-room))) scale(0.6);
}

.is-day .day-step {
  pointer-events: auto;
  opacity: 1;
  transform: none;
}

.is-day .day-step:disabled {
  color: rgba(255, 255, 255, 0.3);
}

.is-day .day-step:not(:disabled):active {
  transform: scale(0.92);
}

@media (prefers-reduced-motion: reduce) {
  .bottom-nav-item,
  .bottom-nav-row,
  .glass-pill,
  .day-step {
    transition: none;
  }
}
</style>
