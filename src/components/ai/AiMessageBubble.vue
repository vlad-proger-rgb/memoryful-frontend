<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import BoxyLoader from '@/components/ui/BoxyLoader.vue'
import type { ChatMessage } from '@/types/chat'

const props = defineProps<{
  message: ChatMessage
}>()

marked.setOptions({ gfm: true, breaks: true })

const isUser = computed(() => props.message.role === 'user')
const renderedContent = computed(() => marked(props.message.content) as string)
const tools = computed(() => props.message.tools ?? [])
// Dots fill the wait before the first token. A running tool has its own loader,
// so they'd only be noise next to it.
const showThinking = computed(
  () =>
    props.message.streaming &&
    !props.message.content &&
    !tools.value.some((tool) => tool.status === 'running'),
)

/** "get_day_by_timestamp" -> "Get day by timestamp" */
const toolLabel = (name: string) => {
  const words = name.replace(/_/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// Stored tools carry no status — they finished long ago.
const isRunning = (status?: string) => status === 'running'

const timeLabel = computed(() => {
  if (!props.message.createdAt) return ''
  const date = new Date(props.message.createdAt)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const isCopied = ref(false)
let copyTimeout: number | null = null

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    isCopied.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = window.setTimeout(() => {
      isCopied.value = false
    }, 1500)
  } catch {
    // clipboard unavailable, fail silently
  }
}
</script>

<template>
  <div class="group flex w-full" :class="isUser ? 'justify-end' : 'justify-start'">
    <div
      class="relative max-w-[85%] rounded-2xl px-4 py-3 backdrop-blur-md"
      :class="
        isUser
          ? 'bg-gradient-to-br from-white/20 to-white/10 border border-white/10 rounded-br-md'
          : 'bg-gradient-to-br from-indigo-500/20 via-slate-900/50 to-fuchsia-500/15 border border-indigo-300/10 rounded-bl-md shadow-lg shadow-indigo-950/30'
      "
    >
      <div v-if="!isUser" class="flex items-center gap-1.5 mb-1.5 text-[11px] font-medium text-fuchsia-300/90">
        <font-awesome-icon icon="wand-magic-sparkles" class="text-[10px]" />
        MemoryfulAI
      </div>

      <div v-if="!isUser && tools.length" class="mb-2.5 flex flex-col gap-1.5">
        <div
          v-for="(tool, i) in tools"
          :key="`${tool.name}-${i}`"
          class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.04] px-2.5 py-1.5"
        >
          <BoxyLoader
            v-if="isRunning(tool.status)"
            variant="squares"
            :size="26"
            color-from="#6366f1"
            color-to="#d946ef"
            :label="`Running ${toolLabel(tool.name)}`"
          />
          <span
            v-else
            class="flex size-[26px] items-center justify-center rounded-lg bg-emerald-400/15"
          >
            <font-awesome-icon icon="check" class="text-xs text-emerald-300" />
          </span>
          <span class="text-[13px] font-medium text-white/75">{{ toolLabel(tool.name) }}</span>
        </div>
      </div>

      <div
        v-if="isUser"
        class="text-sm text-white whitespace-pre-wrap break-words leading-relaxed"
      >{{ message.content }}</div>
      <BoxyLoader
        v-else-if="showThinking"
        variant="bars"
        :size="34"
        color-from="hsl(223,90%,55%)"
        color-to="hsl(283,90%,55%)"
        label="MemoryfulAI is thinking"
      />
      <div
        v-else
        class="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed"
        v-html="renderedContent"
      />

      <div
        v-if="timeLabel"
        class="mt-1.5 text-[10px] tabular-nums text-white/35"
        :class="isUser ? 'text-right' : 'text-left'"
      >
        {{ timeLabel }}
      </div>

      <button
        type="button"
        class="absolute -bottom-2.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full size-6 flex items-center justify-center"
        :class="isUser ? 'left-2' : 'right-2'"
        title="Copy"
        @click="copyContent"
      >
        <font-awesome-icon
          :icon="isCopied ? 'check' : 'copy'"
          class="text-[10px]"
          :class="isCopied ? 'text-emerald-300' : 'text-white/70'"
        />
      </button>
    </div>
  </div>
</template>
