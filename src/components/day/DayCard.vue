<template>
  <div
    class="relative w-full max-w-2xl mx-auto min-h-[180px] bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl p-4 mb-8 flex gap-4 text-white"
  >
    <slot name="image" />
    <div class="flex-1 flex flex-col justify-between">
      <slot name="info" />
      <slot name="stats" />
      <div class="flex items-end justify-between mt-4">
        <slot name="learning-items" />
        <slot name="open" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
