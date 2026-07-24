<script setup lang="ts">
import { ref } from 'vue'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'
import { useAiChatStore } from '@/stores/aiChat'
import AiProviderIcon from './AiProviderIcon.vue'
import type { ChatModelOption } from '@/types/chat'

const store = useAiChatStore()
const isOpen = ref(false)
const buttonRef = ref<HTMLElement | null>(null)

const select = (m: ChatModelOption) => {
  store.selectModel(m.id)
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      ref="buttonRef"
      type="button"
      class="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full pl-2 pr-2 py-1 text-xs text-white/90 transition-colors min-w-[150px] max-w-[240px]"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="isOpen = true"
    >
      <AiProviderIcon
        v-if="store.selectedModel"
        :provider="store.selectedModel.provider"
        class="text-[11px]"
        :class="store.selectedModel?.provider === 'openai' ? 'text-emerald-300' : 'text-fuchsia-300'"
      />
      <font-awesome-icon v-else icon="wand-magic-sparkles" class="text-[11px] text-fuchsia-300" />
      <span class="truncate min-w-0 flex-1 text-left">{{ store.selectedModel?.label || 'Select model' }}</span>
      <font-awesome-icon icon="chevron-down" class="text-[10px] text-white/50" />
    </button>

    <BaseAutocomplete
      v-model:show="isOpen"
      :items="store.chatModels"
      :attach-to="buttonRef"
      item-key="id"
      item-label="label"
      searchable
      min-width="240px"
      @select="select"
    >
      <template #item="{ item }">
        <div class="flex items-center justify-between w-full gap-2">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <AiProviderIcon
              :provider="item.provider"
              class="text-xs"
              :class="item.provider === 'openai' ? 'text-emerald-300' : 'text-white/70'"
            />
            <span class="truncate min-w-0 flex-1 text-left">{{ item.label }}</span>
          </div>
          <font-awesome-icon
            v-if="item.id === store.selectedModelId"
            icon="check"
            class="text-emerald-300 text-xs"
          />
        </div>
      </template>
    </BaseAutocomplete>
  </div>
</template>
