<script setup lang="ts">
import { computed } from 'vue'
import { useResolvedStorageMedia } from '@/composables/useResolvedStorageMedia'

const props = defineProps<{
  src: string | undefined
  alt?: string
  size?: 'small' | 'large' | 'card'
}>()

const SIZES = {
  small: 'w-64 h-48',
  large: 'w-128 h-96',
  // square below md so the month card's top row still fits a phone, whatever the aspect ratio
  card: 'w-24 h-24 md:w-64 md:h-48',
}

const imageClass = computed(
  () => `${SIZES[props.size ?? 'large']} shrink-0 object-cover rounded-2xl`,
)

const { url: resolvedSrc } = useResolvedStorageMedia(() => props.src)
</script>

<template>
  <img v-if="resolvedSrc" :src="resolvedSrc" :alt="alt" :class="imageClass" />
  <img
    v-else
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    :alt="alt"
    :class="[imageClass, 'brightness-75']"
  />
</template>
