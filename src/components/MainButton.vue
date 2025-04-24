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
  },
  hideText: {
    type: Boolean,
    default: false
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
    return 'flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600/10 to-blue-500/10 text-white font-semibold text-lg px-6 py-2 rounded-xl transition cursor-not-allowed'
  }

  if (props.hasError) {
    return 'flex items-center justify-center gap-2 bg-gradient-to-r from-red-600/20 to-red-500/20 text-white font-semibold text-lg px-6 py-2 rounded-xl hover:from-red-700 hover:to-red-600 transition hover:cursor-pointer'
  }

  return 'flex items-center justify-center gap-2 bg-gradient-to-r from-white/30 to-white/20 text-white font-semibold text-lg px-6 py-2 rounded-xl hover:from-white/40 hover:to-white/30 transition hover:cursor-pointer'
})
</script>

<template>
  <button @click="handleClick" :class="buttonClass" :disabled="disabled || loading">
    <slot name="icon-left"></slot>
    <slot v-if="!hideText">Button</slot>
    <slot name="icon-right"></slot>
  </button>
</template>
