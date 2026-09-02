<script setup lang="ts">
import { computed } from 'vue'

import logo from '@/assets/img/memoryful-ai-brain.webp'
import { useAiChatStore } from '@/stores/aiChat'

const props = withDefaults(
  defineProps<{
    size?: number
    ringSpread?: number
    outerRingSpread?: number
    outerRingHeightSpread?: number
  }>(),
  {
    size: 60,
    // How far the halo reaches past the logo. The header default keeps it inside the bar;
    // the bottom bar passes a wider one so the rotation is actually readable.
    ringSpread: 1.2333,
    // A second, wider and fainter ring set. 0 leaves the orb single-ringed; anything above
    // 1 also grows the button itself, so the outer ring is part of the target.
    outerRingSpread: 0,
    // Lets the outer set be an ellipse — wide to the sides without growing taller than a
    // bar it has to live in. 0 keeps it circular.
    outerRingHeightSpread: 0,
  },
)

const outerHeightSpread = computed(() => props.outerRingHeightSpread || props.outerRingSpread)

const aiChatStore = useAiChatStore()
const { isOpen: isAiChatOpen, toggle: toggleAiChat } = aiChatStore
</script>

<template>
  <button
    type="button"
    class="ai-logo-orbit rounded-full transition-transform duration-150 hover:scale-105"
    :class="{ 'is-open': isAiChatOpen, 'has-outer-ring': props.outerRingSpread > 0 }"
    :style="{
      '--orb-size': `${size}px`,
      '--orb-ring-spread': ringSpread,
      '--orb-outer-ring-spread': props.outerRingSpread,
      '--orb-outer-ring-height-spread': outerHeightSpread,
    }"
    title="MemoryfulAI"
    aria-label="Open MemoryfulAI"
    @click="toggleAiChat()"
  >
    <span v-if="props.outerRingSpread > 0" class="orbit-rings orbit-rings-outer" aria-hidden="true">
      <span class="circle"></span>
      <span class="circle"></span>
      <span class="circle"></span>
    </span>
    <span class="orbit-rings" aria-hidden="true">
      <span class="circle"></span>
      <span class="circle"></span>
      <span class="circle"></span>
      <span class="circle"></span>
    </span>
    <!-- draggable=false, or the browser lifts the logo as a file ghost on any drag. -->
    <img :src="logo" class="orbit-logo rounded-full" alt="" draggable="false" />
  </button>
</template>

<style scoped>
/* "Saturn rings of trash" orbiting the MemoryfulAI logo — signals it's clickable/CTA.
   Every dimension derives from --orb-size so the halo keeps its proportions whether it
   sits in the desktop header or is blown up as the mobile bottom-bar FAB. */
.ai-logo-orbit {
  position: relative;
  display: inline-grid;
  place-items: center;
  isolation: isolate;
  cursor: pointer;
}

/* The button grows to the outer ring so the whole halo is clickable, not just the logo. */
.ai-logo-orbit.has-outer-ring {
  width: calc(var(--orb-size) * var(--orb-outer-ring-spread));
  height: calc(var(--orb-size) * var(--orb-outer-ring-height-spread));
}

.orbit-logo {
  position: relative;
  z-index: 2;
  width: var(--orb-size);
  height: var(--orb-size);
  /* Slightly translucent + soft, faded edges so it blends like the rest of the UI. */
  opacity: 0.8;
  -webkit-mask-image: radial-gradient(circle at center, #000 58%, transparent 84%);
  mask-image: radial-gradient(circle at center, #000 58%, transparent 84%);
  transition: opacity 0.4s ease;
}

.orbit-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--orb-size) * var(--orb-ring-spread));
  height: calc(var(--orb-size) * var(--orb-ring-spread));
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  opacity: 0.85;
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.orbit-rings .circle {
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 50%;
  background: rgba(138, 43, 226, 0.05);
  will-change: transform;
  transition:
    box-shadow 0.4s ease,
    background 0.4s ease;
}

.orbit-rings .circle:nth-of-type(1) {
  width: 97.3%;
  height: 81.1%;
  animation: orbit-rt 6s infinite linear;
  box-shadow: inset 0 0 6px 0 blueviolet;
}
.orbit-rings .circle:nth-of-type(2) {
  width: 81.1%;
  height: 97.3%;
  animation: orbit-rt 10s infinite linear;
  box-shadow: inset 0 0 6px 0 darkviolet;
}
.orbit-rings .circle:nth-of-type(3) {
  width: 94.6%;
  height: 86.5%;
  animation: orbit-rt 5s infinite linear reverse;
  box-shadow: inset 0 0 6px 0 darkmagenta;
}
.orbit-rings .circle:nth-of-type(4) {
  width: 86.5%;
  height: 94.6%;
  animation: orbit-rt 15s infinite linear;
  box-shadow: inset 0 0 6px 0 magenta;
}

/* Intensify the halo on hover / when the chat is open, to reinforce the CTA. */
.ai-logo-orbit:hover .orbit-logo,
.ai-logo-orbit.is-open .orbit-logo {
  opacity: 0.95;
}
.ai-logo-orbit:hover .orbit-rings,
.ai-logo-orbit.is-open .orbit-rings {
  opacity: 1;
  /* Widen horizontally only (a "voice-listener" oval) so the halo grows into the
     header's free horizontal space without getting any taller / clipping. */
  transform: translate(-50%, -50%) scaleX(1.2);
}
.ai-logo-orbit:hover .orbit-rings .circle,
.ai-logo-orbit.is-open .orbit-rings .circle {
  background: rgba(138, 43, 226, 0.1);
}
.ai-logo-orbit:hover .orbit-rings .circle:nth-of-type(1),
.ai-logo-orbit.is-open .orbit-rings .circle:nth-of-type(1) {
  box-shadow: inset 0 0 8px 0 blueviolet;
}
.ai-logo-orbit:hover .orbit-rings .circle:nth-of-type(2),
.ai-logo-orbit.is-open .orbit-rings .circle:nth-of-type(2) {
  box-shadow: inset 0 0 8px 0 darkviolet;
}
.ai-logo-orbit:hover .orbit-rings .circle:nth-of-type(3),
.ai-logo-orbit.is-open .orbit-rings .circle:nth-of-type(3) {
  box-shadow: inset 0 0 8px 0 darkmagenta;
}
.ai-logo-orbit:hover .orbit-rings .circle:nth-of-type(4),
.ai-logo-orbit.is-open .orbit-rings .circle:nth-of-type(4) {
  box-shadow: inset 0 0 8px 0 magenta;
}

/* The outer set: wider, fainter, slower — it reads as the same object seen further out. */
.orbit-rings-outer {
  width: calc(var(--orb-size) * var(--orb-outer-ring-spread));
  height: calc(var(--orb-size) * var(--orb-outer-ring-height-spread));
  opacity: 0.4;
  z-index: 0;
}

.orbit-rings-outer .circle:nth-of-type(1) {
  width: 99%;
  height: 78%;
  animation: orbit-rt 18s infinite linear;
  box-shadow: inset 0 0 8px 0 blueviolet;
}
.orbit-rings-outer .circle:nth-of-type(2) {
  width: 78%;
  height: 99%;
  animation: orbit-rt 24s infinite linear reverse;
  box-shadow: inset 0 0 8px 0 darkmagenta;
}
.orbit-rings-outer .circle:nth-of-type(3) {
  width: 92%;
  height: 92%;
  animation: orbit-rt 30s infinite linear;
  box-shadow: inset 0 0 8px 0 darkviolet;
}

.ai-logo-orbit:hover .orbit-rings-outer,
.ai-logo-orbit.is-open .orbit-rings-outer {
  opacity: 0.65;
  transform: translate(-50%, -50%) scaleX(1.1);
}

@keyframes orbit-rt {
  100% {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-rings .circle {
    animation: none;
  }
}
</style>
