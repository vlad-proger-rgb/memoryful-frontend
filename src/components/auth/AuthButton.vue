<!-- src/components/auth/AuthButton.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'primary'
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}

const buttonClass = computed(() => {
  if (props.variant === 'link') {
    return 'text-white/80 text-sm hover:text-white transition'
  }

  if (props.loading) {
    return 'flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600/70 to-blue-500/70 text-white font-semibold text-lg px-6 py-2 rounded-xl transition cursor-not-allowed'
  }

  if (props.hasError) {
    return 'flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-lg px-6 py-2 rounded-xl hover:from-red-700 hover:to-red-600 transition hover:cursor-pointer'
  }

  return 'flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg px-6 py-2 rounded-xl hover:from-blue-700 hover:to-blue-600 transition hover:cursor-pointer'
})
</script>

<template>
  <button @click="handleClick" :class="buttonClass" :disabled="disabled || loading">
    <slot name="icon-left"></slot>
    <slot>Button</slot>
    <slot name="icon-right"></slot>
  </button>
</template>
