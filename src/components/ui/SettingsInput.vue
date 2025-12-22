<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type Model = string | number | null

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: Model
    modelModifiers?: Record<string, boolean>
  }>(),
  {
    modelModifiers: () => ({}),
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Model): void
}>()

const attrs = useAttrs()

const baseClass = 'w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none text-sm'

const mergedClass = computed(() => {
  const extra = attrs.class
  if (!extra) return baseClass
  if (typeof extra === 'string') return `${baseClass} ${extra}`
  return [baseClass, extra]
})

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  let next: Model = el.value

  // support v-model.number
  if (props.modelModifiers?.number) {
    next = el.value === '' ? null : Number(el.value)
  }

  emit('update:modelValue', next)
}
</script>

<template>
  <input
    v-bind="{ ...attrs, class: mergedClass }"
    :value="modelValue ?? ''"
    @input="onInput"
  />
</template>
