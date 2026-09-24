<script setup lang="ts">
import { onMounted, ref, useId } from 'vue'

const paintId = useId()
const button = ref<HTMLButtonElement | null>(null)
const cornerRadius = ref('0px')
const sweeping = ref(false)
const presses = ref(0)

onMounted(() => {
  if (!button.value) return
  // The streaks run 1px inside the caller's corners (see .glint-lines inset).
  const radius = parseFloat(getComputedStyle(button.value).borderTopLeftRadius)
  cornerRadius.value = `${Math.max(radius - 1, 0)}px`
})

// A tap has no hover, so on touch the press ring answers alone.
const startSweep = (event: PointerEvent) => {
  if (event.pointerType !== 'touch') sweeping.value = true
}
</script>

<template>
  <button
    ref="button"
    type="button"
    class="glint-button"
    :class="{ 'is-sweeping': sweeping }"
    @pointerenter="startSweep"
    @click="presses++"
  >
    <slot />
    <span
      class="glint-lines"
      :style="{ '--corner-radius': cornerRadius }"
      aria-hidden="true"
      @animationend="sweeping = false"
    >
      <!-- Mirrors the button's gradient: pink over its purple end, violet over its pink end. -->
      <svg class="glint-paint">
        <linearGradient :id="`${paintId}-1`">
          <stop offset="0" stop-color="#f472b6" />
          <stop offset="1" stop-color="#5b21b6" />
        </linearGradient>
        <!-- The second half is rotated 180deg, so its paint runs the other way to match. -->
        <linearGradient :id="`${paintId}-2`" :href="`#${paintId}-1`" x1="1" x2="0" />
      </svg>
      <span
        v-for="half in 2"
        :key="half"
        class="glint-half"
        :style="{ '--glint-paint': `url(#${paintId}-${half})` }"
      >
        <svg v-for="layer in 4" :key="layer">
          <rect width="100%" height="100%" pathLength="10" />
        </svg>
      </span>
    </span>
    <span v-if="presses" :key="presses" class="glint-ping" aria-hidden="true" />
  </button>
</template>

<style scoped>
/* Sweep adapted from Aaron Iker's MIT-licensed pen: codepen.io/aaroniker/pen/NPqVyMx */
.glint-button {
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.glint-lines {
  position: absolute;
  inset: 1px;
  z-index: 1;
  pointer-events: none;
}

.glint-paint {
  position: absolute;
  width: 0;
  height: 0;
}

.glint-half {
  position: absolute;
  inset: 0;
}

/* The second streak starts from the opposite corner. */
.glint-half:last-child {
  transform: rotate(180deg);
}

.glint-half svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  stroke: var(--glint-paint);
  stroke-width: 1.5px;
  stroke-dasharray: 2 10;
  stroke-dashoffset: 14;
  opacity: 0;
}

/* Not a bound :rx: Vue patches svg in a constant-range v-for as HTML, so updates never land. */
.glint-half rect {
  rx: var(--corner-radius);
}

.glint-half svg:nth-child(2) {
  stroke-width: 6px;
  filter: blur(20px);
}

.glint-half svg:nth-child(3) {
  stroke-width: 5px;
  filter: blur(6px);
}

.glint-half svg:nth-child(4) {
  stroke-width: 10px;
  filter: blur(56px);
}

.is-sweeping .glint-half svg {
  animation: glint-sweep 1s linear;
}

.glint-ping {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  outline: 1.5px solid #d8b4fe;
  filter: drop-shadow(0 0 4px rgba(192, 132, 252, 0.7));
  animation:
    glint-ping-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    glint-ping-fade 0.6s ease-in;
}

@keyframes glint-sweep {
  30%,
  55% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 4;
    opacity: 0;
  }
}

@keyframes glint-ping-grow {
  from {
    outline-offset: 0;
  }
  to {
    outline-offset: 7px;
  }
}

@keyframes glint-ping-fade {
  from {
    opacity: 0.9;
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glint-lines,
  .glint-ping {
    display: none;
  }
}
</style>
