<!-- src/components/auth/AuthCard.vue -->
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div
    class="bg-white/20 backdrop-blur-lg border p-8 rounded-[32px] shadow-2xl max-w-sm w-full flex flex-col items-center gap-6 text-white"
  >
    <p class="text-3xl font-semibold tracking-wide">{{ title }}</p>
    <p v-if="subtitle" class="text-white/80 text-center" :class="{'-mt-4': true}">{{ subtitle }}</p>

    <slot></slot>
  </div>
</template>
