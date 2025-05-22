<template>
  <img
    v-if="src"
    :src="'/src/assets/img/' + src"
    :alt="alt"
    class="w-64 h-48 object-cover rounded-2xl"
  />
  <div v-else>
    <img
      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
      :alt="alt"
      class="w-64 h-48 object-cover rounded-2xl brightness-75"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ src: string | undefined; alt?: string }>()
</script>
