<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import fallbackAvatar from '@/assets/img/avatar-fallback.webp'
import { useResolvedStorageMedia } from '@/composables'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const displayName = computed(() => userStore.user.firstName || 'User')
const { url: avatarUrl } = useResolvedStorageMedia(() => userStore.user.photo, {
  fallbackSrc: fallbackAvatar,
})

// The card and the settings header share `view-transition-name: welcome-card`, so the browser
// tweens one into the other. Chrome-only today; everywhere else this is a normal push.
const openProfile = async () => {
  const target = '/settings/profile'
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!document.startViewTransition || prefersReducedMotion) {
    router.push(target)
    return
  }

  document.startViewTransition(async () => {
    await router.push(target)
    await nextTick()
  })
}
</script>

<template>
  <!-- Takes its display from the caller, so a caller's `hidden` never fights a `flex` here. -->
  <button
    type="button"
    class="glass-panel w-full cursor-pointer items-center gap-3 p-3 text-left text-white transition-[scale,background-color] duration-150 [view-transition-name:welcome-card] hover:scale-103 hover:bg-white/25 hover:shadow-[0_14px_34px_-18px_rgba(0,0,0,0.9)] active:scale-98 motion-reduce:hover:scale-100"
    @click="openProfile"
  >
    <img
      :src="avatarUrl ?? fallbackAvatar"
      alt=""
      class="size-11 shrink-0 rounded-full object-cover md:size-12"
    />
    <div class="min-w-0 text-left">
      <p class="text-xs text-white/70">Welcome,</p>
      <p class="truncate text-base font-semibold md:text-lg">{{ displayName }}</p>
    </div>
    <font-awesome-icon icon="angle-right" class="ml-auto text-white/40" />
  </button>
</template>
