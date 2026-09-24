<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    text: string
    label?: string
    size?: 'sm' | 'md'
  }>(),
  {
    label: 'Copy',
    size: 'md',
  },
)

// legacy falls back to execCommand where navigator.clipboard is missing, e.g. plain-http LAN dev
const { copied, copy } = useClipboard({ legacy: true })
</script>

<template>
  <button
    type="button"
    class="shrink-0 grid place-items-center rounded-full cursor-pointer transition-[background-color,box-shadow,scale,opacity] duration-200 ease-out active:scale-90 motion-reduce:transition-none"
    :class="[
      size === 'sm' ? 'size-6' : 'size-11 md:size-8',
      copied
        ? 'bg-emerald-400/20 ring-1 ring-emerald-300/40'
        : 'bg-white/10 hover:bg-white/20 ring-0 ring-transparent',
    ]"
    :aria-label="copied ? 'Copied' : props.label"
    :title="props.label"
    @click="copy(props.text)"
  >
    <font-awesome-icon
      icon="copy"
      class="col-start-1 row-start-1 text-white/70 transition-[opacity,scale,rotate] duration-200 ease-out motion-reduce:transition-none"
      :class="[
        size === 'sm' ? 'text-[10px]' : 'text-sm',
        copied ? 'opacity-0 scale-50 -rotate-45' : 'opacity-100 scale-100 rotate-0',
      ]"
    />
    <font-awesome-icon
      icon="check"
      class="col-start-1 row-start-1 text-emerald-300 transition-[opacity,scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
      :class="[
        size === 'sm' ? 'text-[10px]' : 'text-sm',
        copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-45',
      ]"
    />
  </button>
</template>
