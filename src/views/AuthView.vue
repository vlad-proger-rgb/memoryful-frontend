<script setup lang="ts">
import { RouterView } from 'vue-router'
import bg from '@/assets/img/auth-bg.jpg'
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${bg})` }"
    class="overflow-hidden min-h-screen bg-cover bg-center flex justify-center items-center"
  >
    <RouterView />
  </div>
</template>
