<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  icon: {
    type: String,
    required: true
  },
  hasError: {
    type: Boolean,
    default: false
  },
  inputMode: {
    type: String,
    default: undefined
  },
  pattern: {
    type: String,
    default: undefined
  },
  fullWidth: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (props.inputMode === 'numeric') {
    const numericValue = value.replace(/[^0-9]/g, '')
    ;(event.target as HTMLInputElement).value = numericValue
    emit('update:modelValue', numericValue)
    return
  }
  emit('update:modelValue', value)
}

const containerClass = computed(() => {
  const baseClasses = 'flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl focus-within:ring-1 transition'
  const widthClasses = props.fullWidth ? 'w-full max-w-[320px]' : 'max-w-[160px]'
  const errorClasses = props.hasError ? 'border border-red-500' : 'focus-within:ring-white'

  return `${baseClasses} ${widthClasses} ${errorClasses}`
})
</script>

<template>
  <div :class="containerClass">
    <input
      :value="modelValue"
      @input="updateValue"
      :type="type"
      :placeholder="placeholder"
      :inputmode="inputMode"
      :pattern="pattern"
      class="bg-transparent outline-none !placeholder-white text-white w-full"
    />
    <font-awesome-icon :icon="icon" class="text-white" />
  </div>
</template>
