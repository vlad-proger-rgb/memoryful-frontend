<script setup lang="ts">
import { RouterLink } from 'vue-router'

import logo from '@/assets/img/memoryful-ai-brain.png'
import aiLogo from '@/assets/img/memoryful-ai-brain.png'
import { useAiChatStore } from '@/stores/aiChat'

// import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'NavBar',
})

// const userStore = useUserStore()
const aiChatStore = useAiChatStore()
const { isOpen: isAiChatOpen, toggle: toggleAiChat } = aiChatStore
</script>

<template>
  <nav
    class="flex justify-between items-center p-1 bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,1)_100%)] text-white backdrop-blur-sm"
  >
    <RouterLink to="/dashboard">
      <img :src="logo" class="rounded-full" width="60px" height="60px" alt="Memoryful Logo" />
    </RouterLink>

    <RouterLink to="/calendar" class="flex items-center">
      <p class="mr-2 text-2xl">Calendar</p>
      <font-awesome-icon icon="calendar" class="text-xl" />
    </RouterLink>

    <button
      type="button"
      class="ai-logo-orbit rounded-full transition-transform duration-150 hover:scale-105"
      :class="{ 'is-open': isAiChatOpen }"
      title="MemoryfulAI"
      @click="toggleAiChat()"
    >
      <span class="orbit-rings" aria-hidden="true">
        <span class="circle"></span>
        <span class="circle"></span>
        <span class="circle"></span>
        <span class="circle"></span>
      </span>
      <img
        :src="aiLogo"
        class="orbit-logo rounded-full"
        width="60px"
        height="60px"
        alt="MemoryfulAI Logo"
      />
    </button>

    <RouterLink to="/search" class="flex items-center">
      <p class="mr-2 text-2xl">Search</p>
      <font-awesome-icon icon="search" class="text-xl" />
    </RouterLink>

    <RouterLink to="/settings">
      <!-- <img
        :src="userStore.user?.photoUrl"
        class="rounded-full"
        width="60px"
        height="60px"
        alt="Profile Picture"
      /> -->
      <font-awesome-icon icon="user" class="text-3xl mr-2" />
    </RouterLink>
  </nav>
</template>

<style scoped>
/* "Saturn rings of trash" orbiting the MemoryfulAI logo — signals it's clickable/CTA.
   Kept compact so the halo stays inside the header bar and reads as a subtle accent. */
.ai-logo-orbit {
  position: relative;
  display: inline-grid;
  place-items: center;
  isolation: isolate;
}

.orbit-logo {
  position: relative;
  z-index: 2;
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
  width: 74px;
  height: 74px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  opacity: 0.7;
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.orbit-rings .circle {
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 50%;
  background: rgba(138, 43, 226, 0.02);
  will-change: transform;
  transition:
    box-shadow 0.4s ease,
    background 0.4s ease;
}

.orbit-rings .circle:nth-of-type(1) {
  width: 72px;
  height: 60px;
  animation: orbit-rt 6s infinite linear;
  box-shadow: inset 0 0 4px 0 blueviolet;
}
.orbit-rings .circle:nth-of-type(2) {
  width: 60px;
  height: 72px;
  animation: orbit-rt 10s infinite linear;
  box-shadow: inset 0 0 4px 0 darkviolet;
}
.orbit-rings .circle:nth-of-type(3) {
  width: 70px;
  height: 64px;
  animation: orbit-rt 5s infinite linear reverse;
  box-shadow: inset 0 0 4px 0 darkmagenta;
}
.orbit-rings .circle:nth-of-type(4) {
  width: 64px;
  height: 70px;
  animation: orbit-rt 15s infinite linear;
  box-shadow: inset 0 0 4px 0 magenta;
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
  background: rgba(138, 43, 226, 0.05);
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
