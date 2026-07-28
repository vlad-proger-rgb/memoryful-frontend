<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import type { ChatMessage } from '@/types/chat'

const props = defineProps<{
  message: ChatMessage
}>()

marked.setOptions({ gfm: true, breaks: true })

const isUser = computed(() => props.message.role === 'user')
const renderedContent = computed(() => marked(props.message.content) as string)
const tools = computed(() => props.message.tools ?? [])
// While streaming with nothing rendered yet, the tool list (or the cursor) is
// the only sign of life, so keep the bubble from looking empty.
const showCursor = computed(() => props.message.streaming && !props.message.content)

/** "get_day_by_timestamp" -> "Get day by timestamp" */
const toolLabel = (name: string) => {
  const words = name.replace(/_/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

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
          : 'bg-black/30 border border-white/5 rounded-bl-md'
      "
    >
      <div v-if="!isUser" class="flex items-center gap-1.5 mb-1.5 text-[11px] font-medium text-fuchsia-300/90">
        <font-awesome-icon icon="wand-magic-sparkles" class="text-[10px]" />
        MemoryfulAI
      </div>

      <div v-if="!isUser && tools.length" class="mb-2 flex flex-col gap-1">
        <div
          v-for="(tool, i) in tools"
          :key="`${tool.name}-${i}`"
          class="flex items-center gap-2 text-[11px] text-white/60"
        >
          <font-awesome-icon
            :icon="tool.status === 'running' ? 'circle-notch' : 'check'"
            :spin="tool.status === 'running'"
            class="text-[10px]"
            :class="tool.status === 'running' ? 'text-sky-300/80' : 'text-emerald-300/80'"
          />
          <span>{{ toolLabel(tool.name) }}</span>
        </div>
      </div>

      <div
        v-if="isUser"
        class="text-sm text-white whitespace-pre-wrap break-words leading-relaxed"
      >{{ message.content }}</div>
      <div
        v-else-if="showCursor"
        class="inline-block h-4 w-1.5 bg-white/60 animate-pulse rounded-sm align-middle"
      />
      <div
        v-else
        class="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed"
        v-html="renderedContent"
      />

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
