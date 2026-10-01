<script setup lang="ts">
import { useResolvedStorageMedia } from '@/composables/useResolvedStorageMedia'

const props = defineProps<{
  src: string | undefined
  alt?: string
}>()

const { url: resolvedSrc } = useResolvedStorageMedia(() => props.src)
</script>

<template>
  <img v-if="resolvedSrc" :src="resolvedSrc" :alt="alt" />
  <img
    v-else
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    :alt="alt"
    class="brightness-75"
  />
</template>
