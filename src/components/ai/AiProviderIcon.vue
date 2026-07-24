<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon, getIcon } from '@/plugins/fontawesome'
// Inline brand SVGs (fill=currentColor, 1em) sourced from Lobe Icons (MIT).
import { aiIcons } from '@/constants/aiProviderIcons'

const props = defineProps<{
  provider: string
  class?: string
}>()

// Backend `provider` enum value -> icon key in aiProviderIcons.
// Prefer the recognizable model glyph where it differs from the vendor mark.
const PROVIDER_TO_ICON: Record<string, string> = {
  openai: 'openai',
  anthropic: 'claude',
  google: 'gemini',
  xai: 'grok',
  meta: 'meta',
  mistral: 'mistral',
  cohere: 'cohere',
  local: 'ollama',
}

const svg = computed<string | undefined>(() => {
  const key = PROVIDER_TO_ICON[props.provider]
  return key ? aiIcons[key] : undefined
})

// Neutral fallback for providers without a brand glyph (azure, other, ...).
const fallbackIcon = computed(() => getIcon({ name: 'robot' }))
</script>

<template>
  <span
    v-if="svg"
    role="img"
    :class="['ai-provider-icon shrink-0 inline-flex', props.class]"
    v-html="svg"
  />
  <font-awesome-icon
    v-else
    :icon="fallbackIcon"
    :class="['shrink-0', props.class]"
  />
</template>

<style scoped>
.ai-provider-icon :deep(svg) {
  width: 1em;
  height: 1em;
  display: block;
}
</style>
