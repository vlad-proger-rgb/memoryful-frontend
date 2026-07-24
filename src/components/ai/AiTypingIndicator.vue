<template>
  <div class="flex justify-start">
    <div class="flex items-center gap-1.5 bg-black/30 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-md">
      <span class="ai-dot" />
      <span class="ai-dot" style="animation-delay: 0.15s" />
      <span class="ai-dot" style="animation-delay: 0.3s" />
    </div>
  </div>
</template>

<style scoped>
.ai-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.6);
  display: inline-block;
  animation: ai-bounce 1.1s infinite ease-in-out both;
}

@keyframes ai-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
