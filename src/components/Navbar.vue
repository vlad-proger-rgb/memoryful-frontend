<script setup lang="ts">
import { RouterLink } from 'vue-router'

import logo from '@/assets/img/logo.svg'
import aiLogo from '@/assets/img/ai_logo.svg'

// import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'NavBar',
})

// const userStore = useUserStore()
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

    <div>
      <img :src="aiLogo" width="60px" height="60px" alt="MemoryfulAI Logo" />
    </div>

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
