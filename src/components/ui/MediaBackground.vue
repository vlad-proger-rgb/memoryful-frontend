<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string | null
    isVideo: boolean
    useCssBackground?: boolean
    className?: string
    fallbackClassName?: string
  }>(),
  {
    useCssBackground: false,
    className: 'fixed inset-0 w-full h-full object-cover -z-10',
    fallbackClassName: 'fixed inset-0 -z-10 bg-center bg-cover',
  },
)
</script>

<template>
  <video v-if="src && isVideo" :class="className" :src="src" autoplay muted loop playsinline />
  <div
    v-else-if="src && useCssBackground"
    :class="fallbackClassName"
    :style="{ backgroundImage: `url(${src})` }"
  />
  <img v-else-if="src" :class="className" :src="src" alt="background" />
  <div v-else :class="fallbackClassName" />
</template>
