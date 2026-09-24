<script setup lang="ts">
import { computed, ref } from 'vue'

import CopyButton from '@/components/ui/CopyButton.vue'
import { getIcon } from '@/plugins/fontawesome'
import type { FAIcon } from '@/types'

const props = defineProps<{
  tone: 'insight' | 'suggestion' | 'thread'
  icon?: FAIcon | null
  title: string
  /** The day the item belongs to. Digest sections span a week and have none. */
  timestamp?: number
  body: string
}>()

const TONES = {
  insight: {
    fallback: ['fas', 'lightbulb'],
    medallion: 'border-amber-300/30 bg-amber-300/15 text-amber-300',
  },
  suggestion: {
    fallback: ['fas', 'wand-magic-sparkles'],
    medallion: 'border-violet-300/30 bg-violet-300/15 text-violet-300',
  },
  thread: {
    fallback: ['fas', 'diagram-project'],
    medallion: 'border-sky-300/30 bg-sky-300/15 text-sky-300',
  },
} as const

const tone = computed(() => TONES[props.tone])

const icon = computed(
  () => (props.icon ? getIcon(props.icon) : tone.value.fallback) as [string, string],
)

const shortDate = computed(() =>
  props.timestamp
    ? new Date(props.timestamp * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '',
)

const copyText = computed(() => `${props.title}\n\n${props.body}`)

const isOpen = ref(false)
</script>

<template>
  <article
    class="overflow-hidden rounded-xl border border-white/8 bg-white/4 transition hover:border-white/15 hover:bg-white/7"
  >
    <button
      type="button"
      class="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span
        class="inline-flex size-8.5 shrink-0 items-center justify-center rounded-xl border text-[13px]"
        :class="tone.medallion"
      >
        <font-awesome-icon :icon="icon" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-sm leading-snug text-white/95">{{ title }}</span>
        <span v-if="shortDate" class="text-[11px] text-white/40">{{ shortDate }}</span>
      </span>
      <font-awesome-icon
        icon="chevron-down"
        class="shrink-0 text-xs text-white/40 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
      :class="isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <div class="mr-3.5 mb-3.5 ml-15 flex flex-col items-end gap-1">
          <p class="self-stretch text-[13px] leading-relaxed whitespace-pre-line text-white/60">
            {{ body }}
          </p>
          <CopyButton
            :text="copyText"
            :label="`Copy ${props.tone}`"
            :tabindex="isOpen ? undefined : -1"
          />
        </div>
      </div>
    </div>
  </article>
</template>
