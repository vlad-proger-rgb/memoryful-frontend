<script setup lang="ts">
import { RouterLink } from 'vue-router'

import logo from '@/assets/img/memoryful-ai-brain.webp'
import AiOrbButton from '@/components/ai/AiOrbButton.vue'
import { navDestinations } from '@/config/navigation'

// import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'NavBar',
})

// const userStore = useUserStore()

const destination = (key: string) => navDestinations.find((d) => d.key === key)!
</script>

<template>
  <nav
    class="flex justify-between items-center p-1 bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,1)_100%)] text-white backdrop-blur-sm"
  >
    <RouterLink :to="destination('dashboard').to">
      <img :src="logo" class="rounded-full w-[60px] h-[60px]" alt="Memoryful Logo" />
    </RouterLink>

    <RouterLink :to="destination('calendar').to" class="flex items-center">
      <p class="mr-2 text-2xl">{{ destination('calendar').label }}</p>
      <font-awesome-icon :icon="destination('calendar').icon" class="text-xl" />
    </RouterLink>

    <AiOrbButton :size="60" />

    <RouterLink :to="destination('search').to" class="flex items-center">
      <p class="mr-2 text-2xl">{{ destination('search').label }}</p>
      <font-awesome-icon :icon="destination('search').icon" class="text-xl" />
    </RouterLink>

    <RouterLink :to="destination('settings').to">
      <!-- <img
        :src="userStore.user?.photoUrl"
        class="rounded-full"
        width="60px"
        height="60px"
        alt="Profile Picture"
      /> -->
      <font-awesome-icon :icon="destination('settings').icon" class="text-3xl mr-2" />
    </RouterLink>
  </nav>
</template>
