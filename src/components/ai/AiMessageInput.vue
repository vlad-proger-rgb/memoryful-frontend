<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useAiChatStore } from '@/stores/aiChat'
import { daysApi } from '@/api'
import type { ChatAttachment } from '@/types/chat'
import type { DayListItem } from '@/types'

const store = useAiChatStore()
const emit = defineEmits<{
  (e: 'attach'): void
}>()
const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const attachments = ref<ChatAttachment[]>([])

// @-mention: `mentionStart` is the index of the '@' being completed, -1 when closed.
const mentionStart = ref(-1)
const mentionQuery = ref('')
const days = ref<DayListItem[]>([])
const daysLoaded = ref(false)
const activeIndex = ref(0)

const MAX_HEIGHT = 140
const MENTION_LIMIT = 8
// Dates contain spaces, so the query can't stop at one — but an unbounded query
// would keep the menu open over a whole sentence after a stray '@'.
const MAX_QUERY_LEN = 24

/** Days are keyed by UTC midnight, so format in UTC or the label can slip a day. */
const dayLabel = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString([], {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const isMentionOpen = computed(() => mentionStart.value >= 0)

const suggestions = computed(() => {
  const query = mentionQuery.value.trim().toLowerCase()
  return days.value
    .filter((day) => {
      if (!query) return true
      return (
        dayLabel(day.timestamp).toLowerCase().includes(query) ||
        (day.description || '').toLowerCase().includes(query)
      )
    })
    .slice(0, MENTION_LIMIT)
})

const autoGrow = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
}

const closeMention = () => {
  mentionStart.value = -1
  mentionQuery.value = ''
  activeIndex.value = 0
}

/** Fetched once per panel session and filtered locally, so typing doesn't fire a
 *  request per keystroke. */
const loadDays = async () => {
  if (daysLoaded.value) return
  daysLoaded.value = true
  try {
    const res = await daysApi.getDays({
      limit: 60,
      sortField: 'timestamp',
      sortOrder: 'desc',
      view: 'list',
    })
    if (res.code === 200 && res.data) {
      // The list endpoint can include placeholder days the user never wrote.
      days.value = res.data.filter((day) => day.exists !== false)
    }
  } catch {
    daysLoaded.value = false // let the next '@' retry
  }
}

const syncMention = () => {
  const el = textareaRef.value
  if (!el) return closeMention()

  const caret = el.selectionStart ?? text.value.length
  const upToCaret = text.value.slice(0, caret)
  const at = upToCaret.lastIndexOf('@')
  if (at === -1) return closeMention()

  const charBefore = at === 0 ? '' : upToCaret[at - 1]
  const query = upToCaret.slice(at + 1)
  const isFreshToken = !charBefore || /\s/.test(charBefore)
  if (!isFreshToken || query.includes('\n') || query.length > MAX_QUERY_LEN) {
    return closeMention()
  }

  mentionStart.value = at
  mentionQuery.value = query
  activeIndex.value = 0
  void loadDays()
}

const onInput = () => {
  autoGrow()
  syncMention()
}

const selectDay = (day: DayListItem) => {
  const el = textareaRef.value
  const caret = el?.selectionStart ?? text.value.length
  const label = dayLabel(day.timestamp)
  const token = `@${label}`
  const before = text.value.slice(0, mentionStart.value)
  const after = text.value.slice(caret)

  text.value = `${before}${token} ${after}`
  if (!attachments.value.some((a) => a.timestamp === day.timestamp)) {
    attachments.value.push({ type: 'day', timestamp: day.timestamp, label })
  }
  closeMention()

  nextTick(() => {
    autoGrow()
    const pos = before.length + token.length + 1
    el?.focus()
    el?.setSelectionRange(pos, pos)
  })
}

const removeAttachment = (timestamp: number) => {
  const removed = attachments.value.find((a) => a.timestamp === timestamp)
  attachments.value = attachments.value.filter((a) => a.timestamp !== timestamp)
  if (removed?.label) {
    text.value = text.value.replace(`@${removed.label}`, '').replace(/ {2,}/g, ' ')
    nextTick(autoGrow)
  }
}

const send = async () => {
  const value = text.value
  if (!value.trim() || store.isSending) return
  const refs = attachments.value.slice()
  text.value = ''
  attachments.value = []
  closeMention()
  nextTick(autoGrow)
  await store.sendMessage(value, refs)
}

const onKeydown = (e: KeyboardEvent) => {
  if (isMentionOpen.value && suggestions.value.length) {
    const count = suggestions.value.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % count
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + count) % count
      return
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      selectDay(suggestions.value[activeIndex.value])
      return
    }
  }
  if (e.key === 'Escape' && isMentionOpen.value) {
    e.preventDefault()
    closeMention()
    return
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

defineExpose({
  fill: (value: string) => {
    text.value = value
    nextTick(() => {
      autoGrow()
      textareaRef.value?.focus()
    })
  },
})
</script>

<template>
  <div class="relative p-3 pt-0 shrink-0">
    <!-- @-mention menu -->
    <div
      v-if="isMentionOpen"
      class="absolute bottom-full left-3 right-3 mb-2 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-md shadow-xl shadow-black/40 z-10 ai-scroll"
    >
      <p class="px-3 py-2 text-[11px] uppercase tracking-wide text-white/35">Reference a day</p>
      <button
        v-for="(day, index) in suggestions"
        :key="day.timestamp"
        type="button"
        class="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors"
        :class="index === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'"
        @mousedown.prevent="selectDay(day)"
        @mouseenter="activeIndex = index"
      >
        <font-awesome-icon icon="calendar-day" class="text-xs text-indigo-300/80" />
        <span class="text-sm text-white/90">{{ dayLabel(day.timestamp) }}</span>
        <span v-if="day.description" class="truncate text-xs text-white/40">
          {{ day.description }}
        </span>
        <font-awesome-icon v-if="day.starred" icon="star" class="ml-auto text-[10px] text-amber-300/80" />
      </button>
      <p v-if="!suggestions.length" class="px-3 py-3 text-sm text-white/40">No matching days</p>
    </div>

    <!-- attached chips -->
    <div v-if="attachments.length" class="flex flex-wrap gap-1.5 pb-2">
      <span
        v-for="attachment in attachments"
        :key="attachment.timestamp"
        class="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/20 bg-indigo-500/15 pl-2.5 pr-1.5 py-1 text-xs text-indigo-100"
      >
        <font-awesome-icon icon="calendar-day" class="text-[10px] text-indigo-300" />
        {{ attachment.label }}
        <button
          type="button"
          class="size-4 rounded-full flex items-center justify-center text-indigo-200/70 hover:bg-white/15 hover:text-white transition-colors"
          title="Remove"
          @click="removeAttachment(attachment.timestamp)"
        >
          <font-awesome-icon icon="xmark" class="text-[10px]" />
        </button>
      </span>
    </div>

    <div
      class="flex items-end gap-2 bg-white/10 hover:bg-white/[0.13] focus-within:bg-white/[0.13] backdrop-blur-md border border-white/10 focus-within:border-white/25 rounded-2xl px-2 py-2 transition-colors"
    >
      <button
        type="button"
        class="shrink-0 size-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        title="Add attachment or mention"
        @click="emit('attach')"
      >
        <font-awesome-icon icon="plus" class="text-sm" />
      </button>

      <textarea
        ref="textareaRef"
        v-model="text"
        rows="1"
        placeholder="Message MemoryfulAI... (@ to reference a day)"
        class="flex-1 resize-none bg-transparent outline-none text-sm text-white placeholder:text-white/40 max-h-[140px] py-1.5"
        :disabled="store.isSending"
        @input="onInput"
        @keydown="onKeydown"
        @click="syncMention"
        @blur="closeMention"
      />
      <button
        type="button"
        class="shrink-0 size-8 rounded-full flex items-center justify-center transition-all duration-150"
        :class="
          text.trim() && !store.isSending
            ? 'bg-white text-black hover:scale-105'
            : 'bg-white/10 text-white/30 cursor-not-allowed'
        "
        :disabled="!text.trim() || store.isSending"
        @click="send"
      >
        <font-awesome-icon v-if="!store.isSending" icon="arrow-up" class="text-xs" />
        <font-awesome-icon v-else icon="circle-notch" class="text-xs animate-spin" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.ai-scroll::-webkit-scrollbar {
  width: 6px;
}

.ai-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
</style>
