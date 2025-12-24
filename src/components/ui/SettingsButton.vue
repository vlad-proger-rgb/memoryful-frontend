<script setup lang="ts">
import { computed } from 'vue'

type Preset = 'primary' | 'compact' | 'refresh' | 'pill' | 'session'

type Tone = 'neutral' | 'danger'

const props = withDefaults(
  defineProps<{
    preset: Preset
    tone?: Tone
    label?: string
    icon?: string
    loading?: boolean
    disabled?: boolean
    loadingIcon?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    tone: 'neutral',
    label: '',
    icon: '',
    loading: false,
    disabled: false,
    loadingIcon: 'circle-notch',
    type: 'button',
  },
)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClass = computed(() => {
  if (props.preset === 'refresh') {
    return 'backdrop-blur-[17.5px] bg-white/15 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-transform duration-150 ease-out hover:bg-white/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
  }

  if (props.preset === 'compact') {
    return 'bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-full px-5 py-2 text-sm flex items-center gap-2 transition-transform duration-150 ease-out active:scale-[0.98]'
  }

  if (props.preset === 'primary') {
    return 'bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 rounded-full px-5 py-2 text-sm flex items-center gap-2 transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 disabled:hover:scale-100 disabled:active:scale-100'
  }

  if (props.preset === 'session') {
    const base = 'text-xs px-3 py-1 rounded-full border transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed'
    const toneClass =
      props.tone === 'danger'
        ? 'bg-red-500/20 border-red-500/40 text-red-200 hover:bg-red-500/30'
        : 'bg-white/10 border-white/25 text-white hover:bg-white/15'

    return `${base} ${toneClass}`
  }

  // pill
  if (props.tone === 'danger') {
    return 'px-4 py-2 rounded-full text-sm bg-red-500/25 border border-red-500/40 text-red-100 hover:bg-red-500/35 transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
  }

  return 'px-4 py-2 rounded-full text-sm bg-white/10 border border-white/20 hover:bg-white/15 transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
})

const handleClick = () => {
  if (isDisabled.value) return
  emit('click')
}

const showIcon = computed(() => !!props.icon || props.loading || props.preset === 'refresh')

const resolvedIcon = computed(() => {
  if (props.loading) return props.loadingIcon
  if (props.icon) return props.icon
  if (props.preset === 'refresh') return 'rotate'
  return ''
})
</script>

<template>
  <button :type="props.type" :class="buttonClass" :disabled="isDisabled" @click="handleClick">
    <font-awesome-icon v-if="showIcon && resolvedIcon" :icon="resolvedIcon" :class="loading ? 'animate-spin' : ''" />
    <slot>
      {{ label }}
    </slot>
  </button>
</template>
