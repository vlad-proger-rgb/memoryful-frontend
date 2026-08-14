<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useAiChatStore } from '@/stores/aiChat'
import AiProviderIcon from './AiProviderIcon.vue'
import type { ChatModelOption } from '@/types/chat'

const store = useAiChatStore()
const isOpen = ref(false)
const buttonRef = ref<HTMLElement | null>(null)

// Which popover to render is behavioral, so it can't be a CSS variant. The query mirrors
// the `touch` variant: the anchored dropdown opens past the right edge on a narrow screen,
// so a coarse pointer gets the sheet instead.
const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)')
const isCoarse = ref(coarsePointer.matches)
const onPointerChange = (event: MediaQueryListEvent) => {
  isCoarse.value = event.matches
}
coarsePointer.addEventListener('change', onPointerChange)
onBeforeUnmount(() => coarsePointer.removeEventListener('change', onPointerChange))

const select = (m: ChatModelOption) => {
  store.selectModel(m.id)
  isOpen.value = false
}
</script>

<template>
  <div class="relative min-w-0">
    <button
      ref="buttonRef"
      type="button"
      class="flex w-full items-center justify-center md:justify-start gap-2 md:gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-3 md:px-2 min-h-11 md:min-h-0 py-1 text-base md:text-xs text-white/90 transition-colors md:min-w-[150px] md:max-w-[240px]"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-label="`Model: ${store.selectedModel?.label || 'none selected'}`"
      @click="isOpen = true"
    >
      <AiProviderIcon
        v-if="store.selectedModel"
        :provider="store.selectedModel.provider"
        class="shrink-0 text-base md:text-[11px]"
        :class="
          store.selectedModel?.provider === 'openai' ? 'text-emerald-300' : 'text-fuchsia-300'
        "
      />
      <font-awesome-icon
        v-else
        icon="wand-magic-sparkles"
        class="shrink-0 text-base md:text-[11px] text-fuchsia-300"
      />
      <!-- `flex-1` only from `md`: on the phone the group centers, on the desktop pill it
           stretches so the chevron stays pinned to the trailing edge. -->
      <span class="truncate min-w-0 md:flex-1 text-left">
        {{ store.selectedModel?.label || 'Select model' }}
      </span>
      <font-awesome-icon
        icon="chevron-down"
        class="shrink-0 text-sm md:text-[10px] text-white/50"
      />
    </button>

    <BottomSheet
      v-if="isCoarse"
      :show="isOpen"
      label="Select a model"
      title="Model"
      @update:show="isOpen = $event"
    >
      <button
        v-for="model in store.chatModels"
        :key="model.id"
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-3 px-4 py-3.5 text-left text-white active:bg-white/10"
        @click="select(model)"
      >
        <AiProviderIcon
          :provider="model.provider"
          class="w-4 shrink-0"
          :class="model.provider === 'openai' ? 'text-emerald-300' : 'text-fuchsia-300'"
        />
        <span class="min-w-0 flex-1 truncate">{{ model.label }}</span>
        <font-awesome-icon
          v-if="model.id === store.selectedModelId"
          icon="check"
          class="shrink-0 text-emerald-300"
        />
      </button>
    </BottomSheet>

    <BaseAutocomplete
      v-else
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
