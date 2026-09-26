<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const isVisible = computed(() => y.value > 200)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <!-- Phone: bottom-right, clear of the raised orb. From lg: the gutter beside the day column. -->
  <Transition enter-from-class="opacity-0" leave-to-class="opacity-0">
    <button
      v-if="isVisible"
      type="button"
      class="fixed right-3 bottom-[calc(var(--bottom-nav-total)+1rem)] z-40 inline-flex min-h-9 cursor-pointer items-center rounded-[10px] border border-white/20 bg-white/12 px-3.5 py-2 text-[13px] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-150 hover:bg-white/20 md:right-6 md:bottom-8 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-[calc(50%+22rem)] lg:-translate-y-1/2"
      @click="scrollToTop"
    >
      <font-awesome-icon icon="arrow-up" class="mr-2" />
      Scroll to top
    </button>
  </Transition>
</template>
