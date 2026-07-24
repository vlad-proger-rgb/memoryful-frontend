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

      <div
        v-if="isUser"
        class="text-sm text-white whitespace-pre-wrap break-words leading-relaxed"
      >{{ message.content }}</div>
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
