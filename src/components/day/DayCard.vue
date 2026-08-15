<script setup lang="ts"></script>

<template>
  <div
    class="relative w-full max-w-2xl mx-auto min-h-[180px] bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl p-4 mb-8 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 md:gap-y-0 md:grid-rows-[auto_auto_1fr] text-white"
  >
    <div class="col-start-1 row-start-1 md:row-span-3">
      <slot name="image" />
    </div>
    <div class="col-start-2 row-start-1 min-w-0">
      <slot name="info" />
    </div>
    <div class="col-span-2 min-w-0 md:col-span-1 md:col-start-2">
      <slot name="stats" />
    </div>
    <div
      class="col-span-2 min-w-0 flex flex-col gap-3 md:col-span-1 md:col-start-2 md:flex-row md:items-end md:justify-between"
    >
      <slot name="learning-items" />
      <slot name="open" />
    </div>
  </div>
</template>
