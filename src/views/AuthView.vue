<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import useUiStore from '@/stores/ui.ts'
import bg from '@/assets/img/auth-bg.jpg'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.disableScroll = true
})
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${bg})` }"
    class="min-h-screen bg-cover bg-center flex justify-center items-center"
  >
    <RouterView />
  </div>
</template>
