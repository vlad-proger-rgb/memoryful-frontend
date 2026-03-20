<script setup lang="ts">
import aiLogo from '@/assets/img/memoryful-ai-brain.png'

const totalParticles = 420
const particles = Array.from({ length: totalParticles }, (_, index) => index + 1)
</script>

<template>
  <div class="orb-shell">
    <div class="orb-clip">
      <div class="orb-core"></div>
      <div class="orb-glow orb-glow-cyan"></div>
      <div class="orb-glow orb-glow-fuchsia"></div>
      <div class="orb-logo-wrap">
        <img :src="aiLogo" alt="Memoryful AI logo" class="orb-logo" />
      </div>
      <div class="particle-center" :style="{ '--total': totalParticles }">
        <div
          v-for="particleIndex in particles"
          :key="particleIndex"
          class="particle"
          :style="{ '--index': particleIndex }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orb-shell {
  position: relative;
  display: grid;
  place-items: center;
  width: min(28rem, 72vw);
  aspect-ratio: 1;
}

.orb-clip {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  overflow: hidden;
  display: grid;
  place-items: center;
  isolation: isolate;
}

.orb-clip::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 4;
  background: radial-gradient(circle, transparent 0 67%, rgba(15, 23, 42, 0.04) 74%, rgba(15, 23, 42, 0.18) 84%, rgba(15, 23, 42, 0.48) 100%);
}

.orb-core {
  position: absolute;
  inset: 12%;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18), transparent 24%),
    radial-gradient(circle at 68% 68%, rgba(34, 211, 238, 0.12), transparent 28%),
    radial-gradient(circle, rgba(15, 23, 42, 0.72) 0%, rgba(8, 15, 32, 0.42) 55%, rgba(2, 6, 23, 0.08) 78%, transparent 86%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(22px);
  box-shadow:
    inset 0 0 80px rgba(255, 255, 255, 0.05),
    inset 0 0 40px rgba(34, 211, 238, 0.06),
    0 0 70px rgba(14, 165, 233, 0.09);
}

.orb-logo-wrap {
  position: absolute;
  inset: 21%;
  display: grid;
  place-items: center;
  z-index: 1;
  pointer-events: none;
}

.orb-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transform: scale(1.02);
  opacity: 0.26;
  filter:
    saturate(0.88)
    brightness(0.96)
    contrast(1.05)
    blur(0.6px)
    drop-shadow(0 0 10px rgba(255, 255, 255, 0.05))
    drop-shadow(0 0 20px rgba(103, 232, 249, 0.06));
  mix-blend-mode: screen;
}

.orb-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(48px);
  opacity: 0.72;
}

.orb-glow-cyan {
  width: 36%;
  height: 36%;
  left: 12%;
  top: 14%;
  background: rgba(34, 211, 238, 0.18);
}

.orb-glow-fuchsia {
  width: 34%;
  height: 34%;
  right: 14%;
  bottom: 16%;
  background: rgba(217, 70, 239, 0.18);
}

.particle-center {
  --total: 420;
  position: relative;
  width: 76%;
  height: 76%;
  border-radius: 9999px;
  animation: orbit-spin 24s linear infinite;
  transform-style: preserve-3d;
  filter: blur(0.35px);
  z-index: 3;
}

.particle {
  --angle: calc(7deg * var(--index));
  --radius: 16;
  --x: calc(sin(var(--angle)) * var(--radius) * 1vmin);
  --y: calc(cos(var(--angle)) * var(--radius) * 1vmin);
  --angle2: calc(var(--index) * 1turn / var(--total));
  --x2: calc(sin(var(--angle2)) * var(--radius) * 1vmin);
  --y2: calc(cos(var(--angle2)) * var(--radius) * 1vmin);
  --size: 4;
  --speed: 4.6s;
  --delay: calc(var(--index) * var(--speed) / var(--total) * 2.4);
  --hue-angle: 10;
  --hue-range: 60;
  --hue-start: 20;
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--size) * 0.14vmin);
  height: calc(var(--size) * 0.14vmin);
  border-radius: 9999px;
  background: currentColor;
  color: oklch(75% 0.3 calc(sin(var(--hue-angle) * var(--index)) * var(--hue-range) + var(--hue-start)));
  transform: translate3d(var(--x), var(--y), 0);
  opacity: 0.18;
  animation: particle-shift var(--speed) ease-in-out infinite alternate var(--delay);
  box-shadow: 0 0 8px currentColor;
  contain: strict;
}

@keyframes particle-shift {
  0% {
    transform: translate3d(var(--x), var(--y), 0) scale(0.75);
    opacity: 0.12;
  }
  100% {
    transform: translate3d(var(--x2), var(--y2), 0) scale(1.15);
    opacity: 0.95;
  }
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg) scale(1.02);
  }
}
</style>
