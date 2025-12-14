<script setup lang="ts">
import { computed } from 'vue'

type InputMode =
  | 'text'
  | 'none'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search'
  | undefined

const props = withDefaults(
  defineProps<{
    modelValue: string | number | undefined
    placeholder: string
    type?: string
    icon: string
    hasError?: boolean
    inputMode?: InputMode
    pattern?: string
    fullWidth?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    hasError: false,
    inputMode: undefined,
    pattern: undefined,
    fullWidth: true,
  },
)

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
  const baseClasses =
    'flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl focus-within:ring-1 transition'
  const widthClasses = props.fullWidth ? 'w-full max-w-[320px]' : 'max-w-[160px]'
  const errorClasses = props.hasError ? 'border border-red-500' : 'focus-within:ring-white'

  return `${baseClasses} ${widthClasses} ${errorClasses}`
})
</script>

<template>
  <div :class="containerClass">
    <input
      :value="modelValue ?? ''"
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

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
