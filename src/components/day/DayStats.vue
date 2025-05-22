<template>
  <div class="flex items-center space-x-8 mt-2 text-lg">
    <div class="flex items-center space-x-2">
      <font-awesome-icon icon="person-walking" class="text-green-400 text-2xl" />
      <span class="text-xl">{{ steps }}</span>
    </div>
    <div class="flex items-center space-x-2">
      <font-awesome-icon icon="city" class="text-white text-2xl" />
      <span class="text-xl">{{ city }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ steps: number; city: string }>()
</script>
