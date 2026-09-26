<script setup lang="ts">
import { useTemplateRef } from 'vue'

defineProps<{ canClear: boolean }>()

const emit = defineEmits<{ submit: []; clear: [] }>()

const query = defineModel<string>({ required: true })
const filtersOpen = defineModel<boolean>('filtersOpen', { required: true })

const input = useTemplateRef<HTMLInputElement>('input')

const iconButton =
  'inline-flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[15px] text-white/75 transition-all duration-150 hover:bg-white/14 hover:text-white'
</script>

<template>
  <div
    class="flex h-11 cursor-text items-center gap-1 rounded-full border border-white/18 bg-white/11 px-1.5 backdrop-blur-[17.5px] transition-[background-color,border-color,box-shadow] duration-250 focus-within:border-white/45 focus-within:bg-white/20 hover:bg-white/20 hover:shadow-[0_12px_30px_-16px_rgba(0,0,0,0.85)]"
    @click="input?.focus()"
  >
    <button
      type="button"
      :class="iconButton"
      aria-label="Search options"
      :aria-expanded="filtersOpen"
      @click.stop="filtersOpen = !filtersOpen"
    >
      <font-awesome-icon icon="gear" />
    </button>

    <input
      ref="input"
      v-model="query"
      type="text"
      placeholder="Quick Search with AI"
      aria-label="Search your days"
      class="min-w-0 flex-1 bg-transparent text-base text-white placeholder-white/50 outline-none md:text-sm"
      @keyup.enter="emit('submit')"
    />

    <button
      v-if="canClear"
      type="button"
      :class="iconButton"
      aria-label="Clear filters"
      @click.stop="emit('clear')"
    >
      <font-awesome-icon icon="rotate-left" />
    </button>

    <button type="button" :class="iconButton" aria-label="Search" @click="emit('submit')">
      <font-awesome-icon icon="magnifying-glass" />
    </button>
  </div>
</template>
