<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import useUiStore from '@/stores/ui.ts'

const uiStore = useUiStore()
</script>

<template>
  <div
    class="h-screen"
    :class="{ 'overflow-hidden': uiStore.disableScroll }"
  >
    <Navbar class="sticky top-0 z-50" />
    <RouterView />
  </div>
</template>

<style scoped></style>
