<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()

const baseClass = 'w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none resize-none text-sm'

const mergedClass = computed(() => {
  const extra = attrs.class
  if (!extra) return baseClass
  if (typeof extra === 'string') return `${baseClass} ${extra}`
  return [baseClass, extra]
})

const onInput = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  emit('update:modelValue', el.value)
}
</script>

<template>
  <textarea
    v-bind="{ ...attrs, class: mergedClass }"
    :value="modelValue"
    @input="onInput"
  />
</template>
