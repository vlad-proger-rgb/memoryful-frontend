<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import useUiStore from '@/stores/ui.ts'
import bg from '@/assets/img/auth-bg.webp'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.disableScroll = true
})

onUnmounted(() => {
  uiStore.disableScroll = false
})
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${bg})` }"
    class="min-h-dvh bg-cover bg-center flex justify-center items-center"
  >
    <RouterView />
  </div>
</template>
