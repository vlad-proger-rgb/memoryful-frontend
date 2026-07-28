<script setup lang="ts">
import { computed } from 'vue'

/**
 * Animated box preloaders (adapted from the "boxy-preloaders" pack).
 *
 * - `squares` two squares trading place and shape — used for running tools
 * - `grid`    four squares rotating as a block
 * - `bars`    three bars hopping
 *
 * Each instance mints its own gradient/mask ids: the source markup shares one
 * global id, which breaks the two-tone fill as soon as two loaders are on screen.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'squares' | 'grid' | 'bars'
    size?: number
    colorFrom?: string
    colorTo?: string
    label?: string
  }>(),
  {
    variant: 'squares',
    size: 28,
    colorFrom: '#6366f1',
    colorTo: '#d946ef',
    label: 'Loading',
  },
)

let seq = 0
const uid = `boxy-${(seq += 1)}-${Math.random().toString(36).slice(2, 7)}`
const gradId = `${uid}-grad`
const maskId = `${uid}-mask`

const px = computed(() => `${props.size}px`)
</script>

<template>
  <svg
    :viewBox="'0 0 128 128'"
    :width="px"
    :height="px"
    :class="`boxy boxy--${variant}`"
    role="img"
    :aria-label="label"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#000" />
        <stop offset="100%" stop-color="#fff" />
      </linearGradient>
      <mask :id="maskId">
        <rect x="0" y="0" width="128" height="128" :fill="`url(#${gradId})`" />
      </mask>
    </defs>

    <template v-if="variant === 'squares'">
      <g v-for="(fill, i) in [colorFrom, colorTo]" :key="i" :fill="fill" :mask="i ? `url(#${maskId})` : undefined">
        <rect class="boxy3__rect" rx="8" ry="8" width="64" height="64" transform="translate(64,0)" />
        <g class="boxy3__rect-g" transform="scale(-1,-1)">
          <rect class="boxy3__rect" rx="8" ry="8" width="64" height="64" transform="translate(64,0)" />
        </g>
      </g>
    </template>

    <template v-else-if="variant === 'grid'">
      <g v-for="(fill, i) in [colorFrom, colorTo]" :key="i" :fill="fill" :mask="i ? `url(#${maskId})` : undefined">
        <g class="boxy1__g">
          <g transform="translate(20,20) rotate(0,44,44)">
            <g class="boxy1__rect-g">
              <rect class="boxy1__rect" rx="8" ry="8" width="40" height="40" />
              <rect class="boxy1__rect" rx="8" ry="8" width="40" height="40" transform="translate(0,48)" />
            </g>
            <g class="boxy1__rect-g" transform="rotate(180,44,44)">
              <rect class="boxy1__rect" rx="8" ry="8" width="40" height="40" />
              <rect class="boxy1__rect" rx="8" ry="8" width="40" height="40" transform="translate(0,48)" />
            </g>
          </g>
        </g>
      </g>
    </template>

    <template v-else>
      <g v-for="(fill, i) in [colorFrom, colorTo]" :key="i" :fill="fill" :mask="i ? `url(#${maskId})` : undefined">
        <g class="boxy2__rect-g">
          <rect class="boxy2__rect" rx="8" ry="8" x="0" y="128" width="40" height="24" transform="rotate(180)" />
        </g>
        <g class="boxy2__rect-g">
          <rect class="boxy2__rect" rx="8" ry="8" x="44" y="128" width="40" height="24" transform="rotate(180)" />
        </g>
        <g class="boxy2__rect-g">
          <rect class="boxy2__rect" rx="8" ry="8" x="88" y="128" width="40" height="24" transform="rotate(180)" />
        </g>
      </g>
    </template>
  </svg>
</template>

<style scoped>
.boxy {
  display: block;
  flex: none;
}

.boxy1__g,
.boxy1__rect,
.boxy2__rect,
.boxy2__rect-g,
.boxy3__rect {
  animation: boxy1-a 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

/* squares */
.boxy3__rect {
  animation-name: boxy3;
}
.boxy3__rect-g {
  transform-origin: 64px 64px;
}

/* grid */
.boxy1__g {
  transform-origin: 64px 64px;
}
.boxy1__rect:first-child {
  animation-name: boxy1-b;
}
.boxy1__rect:nth-child(2) {
  animation-name: boxy1-c;
}

/* bars */
.boxy2__rect,
.boxy2__rect-g {
  animation-name: boxy2-a;
}
.boxy2__rect {
  animation-name: boxy2-b;
}
.boxy2__rect-g .boxy2__rect {
  transform-origin: 20px 128px;
}
.boxy2__rect-g:first-child,
.boxy2__rect-g:first-child .boxy2__rect {
  animation-delay: -0.25s;
}
.boxy2__rect-g:nth-child(2),
.boxy2__rect-g:nth-child(2) .boxy2__rect {
  animation-delay: -0.125s;
}
.boxy2__rect-g:nth-child(2) .boxy2__rect {
  transform-origin: 64px 128px;
}
.boxy2__rect-g:nth-child(3) .boxy2__rect {
  transform-origin: 108px 128px;
}

@keyframes boxy1-a {
  from {
    transform: rotate(0);
  }
  80%,
  to {
    animation-timing-function: steps(1, start);
    transform: rotate(90deg);
  }
}
@keyframes boxy1-b {
  from {
    animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
    width: 40px;
    height: 40px;
  }
  20% {
    animation-timing-function: steps(1, start);
    width: 40px;
    height: 0;
  }
  60% {
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
    width: 0;
    height: 40px;
  }
  80%,
  to {
    width: 40px;
    height: 40px;
  }
}
@keyframes boxy1-c {
  from {
    animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
    width: 40px;
    height: 40px;
    transform: translate(0, 48px);
  }
  20% {
    animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
    width: 40px;
    height: 88px;
    transform: translate(0, 0);
  }
  40% {
    animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
    width: 40px;
    height: 40px;
    transform: translate(0, 0);
  }
  60% {
    animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
    width: 88px;
    height: 40px;
    transform: translate(0, 0);
  }
  80%,
  to {
    width: 40px;
    height: 40px;
    transform: translate(48px, 0);
  }
}
@keyframes boxy2-a {
  from,
  25%,
  66.67%,
  to {
    transform: translateY(0);
  }
  50% {
    animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
    transform: translateY(-80px);
  }
}
@keyframes boxy2-b {
  from,
  to {
    animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
    width: 40px;
    height: 24px;
    transform: rotate(180deg) translateX(0);
  }
  33.33% {
    animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
    width: 20px;
    height: 64px;
    transform: rotate(180deg) translateX(10px);
  }
  66.67% {
    animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
    width: 28px;
    height: 44px;
    transform: rotate(180deg) translateX(6px);
  }
}
@keyframes boxy3 {
  from {
    transform: translate(64px, 0);
    width: 64px;
    height: 64px;
  }
  25% {
    transform: translate(0, 0);
    width: 128px;
    height: 32px;
  }
  50% {
    transform: translate(0, 0);
    width: 64px;
    height: 64px;
  }
  75% {
    transform: translate(0, 0);
    width: 32px;
    height: 128px;
  }
  to {
    transform: translate(0, 64px);
    width: 64px;
    height: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .boxy1__g,
  .boxy1__rect,
  .boxy2__rect,
  .boxy2__rect-g,
  .boxy3__rect {
    animation: none;
  }
}
</style>
