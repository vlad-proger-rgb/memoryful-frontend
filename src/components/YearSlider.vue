<script setup lang="ts">
defineProps({
  year: {
    type: Number,
    required: true,
  },
})

defineEmits(['prev', 'next'])

</script>

<template>
  <div class="flex items-center gap-6 px-4 py-2 bg-white/20 rounded-xl transition">
    <font-awesome-icon @click="$emit('prev')" icon="angle-left" class="text-white" />
    <p class="text-white text-2xl">{{ year }}</p>
    <font-awesome-icon @click="$emit('next')" icon="angle-right" class="text-white" />
  </div>
</template>
