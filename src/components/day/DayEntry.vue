<script setup lang="ts">
defineProps<{
  small?: boolean
}>()
</script>

<template>
  <div
    class="flex justify-between items-center gap-3 bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-4 w-full"
    :class="{ 'py-2 px-4': small }"
  >
    <slot name="icon-left"></slot>
    <slot></slot>
    <slot name="icon-right"></slot>
  </div>
</template>
