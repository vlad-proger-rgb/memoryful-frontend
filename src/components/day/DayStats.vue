<script setup lang="ts">
defineProps<{ steps: number; city: string }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-8 gap-y-1 mt-2 text-lg">
    <div class="flex items-center gap-2">
      <font-awesome-icon icon="person-walking" class="text-green-400 text-2xl" />
      <span class="text-xl">{{ steps }}</span>
    </div>
    <div class="flex min-w-0 items-center gap-2">
      <font-awesome-icon icon="city" class="text-white text-2xl shrink-0" />
      <span class="text-xl min-w-0 break-words">{{ city }}</span>
    </div>
  </div>
</template>
