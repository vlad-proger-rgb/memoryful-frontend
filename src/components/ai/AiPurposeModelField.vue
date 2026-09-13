<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'
import AiProviderIcon from './AiProviderIcon.vue'
import type { ChatModelOption } from '@/types/chat'
import type { PurposeModel } from '@/types/ai'

const props = defineProps<{
  label: string
  description: string
  models: ChatModelOption[]
  selection: PurposeModel | null
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', modelId: string): void
  (e: 'reset'): void
}>()

const isOpen = ref(false)
const buttonRef = ref<HTMLElement | null>(null)

const effective = computed(() => props.selection?.model ?? null)

const select = (model: ChatModelOption) => {
  isOpen.value = false
  if (model.id !== effective.value?.id) emit('select', model.id)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>
      <p class="text-sm font-medium">{{ label }}</p>
      <p class="text-xs opacity-70">{{ description }}</p>
    </div>

    <div class="relative">
      <button
        ref="buttonRef"
        type="button"
        class="w-full flex items-center gap-2 text-left bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-3 md:py-2.5 pr-10 min-h-11 md:min-h-0 outline-none text-base md:text-sm transition-colors focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="`${label}: ${effective?.label || 'loading'}`"
        :disabled="saving || !models.length"
        @click="isOpen = true"
      >
        <AiProviderIcon v-if="effective" :provider="effective.provider" class="text-sm" />
        <span class="block truncate min-w-0 flex-1">{{ effective?.label || 'Loading…' }}</span>
        <span
          v-if="selection?.isDefault"
          class="shrink-0 text-[11px] uppercase tracking-wide opacity-60"
        >
          Default
        </span>
      </button>

      <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
        <font-awesome-icon
          :icon="saving ? 'circle-notch' : 'chevron-down'"
          :class="['text-xs', saving ? 'animate-spin' : '']"
        />
      </div>

      <BaseAutocomplete
        v-model:show="isOpen"
        :items="models"
        :attach-to="buttonRef"
        item-key="id"
        item-label="label"
        searchable
        @select="select"
      >
        <template #item="{ item }">
          <div class="flex items-center justify-between w-full gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <AiProviderIcon :provider="item.provider" class="text-xs" />
              <span class="truncate min-w-0 flex-1 text-left">{{ item.label }}</span>
            </div>
            <font-awesome-icon
              v-if="item.id === effective?.id"
              icon="check"
              class="text-emerald-300 text-xs"
            />
          </div>
        </template>
      </BaseAutocomplete>
    </div>

    <button
      v-if="selection && !selection.isDefault"
      type="button"
      class="self-start text-xs underline underline-offset-2 opacity-70 hover:opacity-100 min-h-11 md:min-h-0 disabled:opacity-40"
      :disabled="saving"
      @click="emit('reset')"
    >
      Use the default
    </button>
  </div>
</template>
