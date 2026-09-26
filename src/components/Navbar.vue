<script setup lang="ts">
import { RouterLink } from 'vue-router'

import AiOrbPet from '@/components/ai/AiOrbPet.vue'
import DashboardIcon from '@/components/ui/DashboardIcon.vue'
import { navDestinations } from '@/config/navigation'
import useFeatureFlagsStore from '@/stores/featureFlags'

defineOptions({
  name: 'NavBar',
})

const featureFlags = useFeatureFlagsStore()

const dashboard = navDestinations.find((d) => d.key === 'dashboard')!
const settings = navDestinations.find((d) => d.key === 'settings')!
</script>

<template>
  <nav
    class="h-[var(--app-header-height)] items-center justify-center gap-[clamp(3rem,9vw,8rem)] bg-[radial-gradient(circle,rgba(0,0,0,0.6)_0%,rgba(0,0,0,1)_100%)] text-white backdrop-blur-sm"
  >
    <RouterLink :to="dashboard.to" class="header-link">
      <DashboardIcon class="text-2xl" />
      <span>{{ dashboard.label }}</span>
    </RouterLink>

    <AiOrbPet :personality="featureFlags.isEnabled('orbPet')" />

    <RouterLink :to="settings.to" class="header-link">
      <font-awesome-icon :icon="settings.icon" class="text-2xl" />
      <span>{{ settings.label }}</span>
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
