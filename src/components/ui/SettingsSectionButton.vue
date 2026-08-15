<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  to: string
  label: string
  icon: string
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] px-4 py-2 min-h-11 md:min-h-0 shrink-0 rounded-full flex items-center justify-between gap-2 transition-transform duration-150 ease-out hover:scale-[1.03] hover:ring-2 hover:ring-white/30 active:scale-[0.98]"
    active-class="ring-2 ring-white/50"
  >
    <span class="text-sm whitespace-nowrap">{{ label }}</span>
    <font-awesome-icon :icon="icon" class="text-sm" />
  </RouterLink>
</template>
