<script setup lang="ts">
const motion = '[transition:height_0.22s_cubic-bezier(0.4,0,0.2,1),opacity_0.18s_ease]'

const setHeight = (el: Element, height: string) => {
  ;(el as HTMLElement).style.height = height
}

const toContentHeight = (el: Element) => setHeight(el, `${(el as HTMLElement).scrollHeight}px`)

const collapse = (el: Element) => {
  // Reading the height first commits the start value, or the browser folds both frames
  // into one and the content vanishes without animating.
  void (el as HTMLElement).offsetHeight
  setHeight(el, '0')
}
</script>

<template>
  <!-- The slotted root must clip (`overflow-hidden`), or its content spills while it grows. -->
  <Transition
    :enter-active-class="motion"
    :leave-active-class="motion"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    @before-enter="setHeight($event, '0')"
    @enter="toContentHeight"
    @after-enter="setHeight($event, 'auto')"
    @before-leave="toContentHeight"
    @leave="collapse"
  >
    <slot />
  </Transition>
</template>
