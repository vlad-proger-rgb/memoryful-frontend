<script setup lang="ts">
import { RouterLink } from 'vue-router'

import DemoDashboardIcon from '@/components/demo/DemoDashboardIcon.vue'
import DemoOrbPet from '@/components/demo/DemoOrbPet.vue'
import { navDestinations } from '@/config/navigation'
import useFeatureFlagsStore from '@/stores/featureFlags'

defineOptions({
  name: 'DemoNavbar',
})

const featureFlags = useFeatureFlagsStore()

const settings = navDestinations.find((d) => d.key === 'settings')!
</script>

<template>
  <nav
    class="h-[var(--app-header-height)] items-center justify-center gap-[clamp(3rem,9vw,8rem)] bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,1)_100%)] text-white backdrop-blur-sm"
  >
    <RouterLink to="/demo/dashboard" class="header-link">
      <DemoDashboardIcon class="text-2xl" />
      <span>Dashboard</span>
    </RouterLink>

    <DemoOrbPet :personality="featureFlags.isEnabled('orbPet')" />

    <RouterLink :to="settings.to" class="header-link">
      <font-awesome-icon :icon="settings.icon" class="text-2xl" />
      <span>Settings</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.header-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.15s ease;
}

.header-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.header-link.router-link-active {
  color: #fff;
}
</style>
