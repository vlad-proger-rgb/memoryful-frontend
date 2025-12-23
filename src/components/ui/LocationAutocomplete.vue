<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Country, City, CityDetail } from '@/types'
import BaseAutocomplete from './BaseAutocomplete.vue'
import { useAutocomplete } from '@/composables'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    icon?: string
    inputId?: string
    showCountryCode?: boolean
    fullWidth?: boolean
    disabled?: boolean
    countryId?: string
    variant?: 'default' | 'auth' | 'settings'
    inputMode?:
      | 'text'
      | 'none'
      | 'tel'
      | 'url'
      | 'email'
      | 'numeric'
      | 'decimal'
      | 'search'
      | undefined
    pattern?: string
    fetchItems: (query: string, countryId?: string) => Promise<Array<Country | City>>
  }>(),
  {
    modelValue: '',
    placeholder: 'Search...',
    icon: '',
    inputId: '',
    showCountryCode: false,
    fullWidth: false,
    disabled: false,
    countryId: '',
    variant: 'default',
    inputMode: 'text',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', item: Country | CityDetail): void
  (e: 'input', value: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const showAutocomplete = ref(false)

const { items, isLoading, search, query } = useAutocomplete<Country | City>({
  fetchItems: async (q) => {
    return props.fetchItems(q, props.countryId)
  },
  minQueryLength: 2,
  debounce: 300,
})

// Initialize query with modelValue
onMounted(() => {
  if (props.modelValue) {
    query.value = props.modelValue
  }
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value

  query.value = value
  search(value)
  showAutocomplete.value = value.length >= 2

  emit('input', value)
  emit('update:modelValue', value)
}

const handleSelect = (item: Country | City | CityDetail) => {
  query.value = item.name
  emit('update:modelValue', item.name)
  emit('select', item as CityDetail | Country)
  showAutocomplete.value = false
}

const handleFocus = () => {
  if (query.value.length >= 2) {
    search(query.value)
    showAutocomplete.value = true
  }
}

// Watch for modelValue changes from parent
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== query.value) {
      query.value = newVal || ''
    }
  },
  { immediate: true },
)

// Update parent when query changes
watch(query, (newVal) => {
  emit('update:modelValue', newVal)
})

// Handle click outside to close the dropdown
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showAutocomplete.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<template>
  <div ref="containerRef" :class="['relative', { 'w-full': fullWidth }]">
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :inputmode="inputMode"
        :pattern="pattern"
        :class="[
          props.variant === 'auth'
            ? 'w-full pl-10 pr-4 py-2 bg-white/20 rounded-xl focus-within:ring-1 transition'
            : props.variant === 'settings'
              ? 'w-full pl-10 pr-4 py-2 bg-black/20 border border-white/15 rounded-xl'
              : 'w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg',
          props.variant === 'auth'
            ? 'text-white !placeholder-white/80 focus:outline-none focus:ring-white'
            : 'text-white placeholder-white/30 focus:outline-none focus:ring-2',
          props.variant === 'auth'
            ? ''
            : 'focus:ring-blue-500 focus:border-transparent',
          { 'pl-10': icon, 'opacity-50': disabled },
        ]"
        @input="handleInput"
        @focus="handleFocus"
      />
      <font-awesome-icon
        v-if="icon"
        :icon="icon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2"
        :class="props.variant === 'auth' ? 'text-white' : 'text-white/50'"
      />
    </div>

    <BaseAutocomplete
      v-model:show="showAutocomplete"
      :items="items"
      :loading="isLoading"
      :attach-to="inputRef"
      item-key="id"
      item-label="name"
      class="z-50"
      @select="handleSelect"
    >
      <template #item="{ item: locationItem }">
        <div class="flex items-center justify-between w-full">
          <span>{{ locationItem.name }}</span>
          <span
            v-if="showCountryCode && 'code' in locationItem"
            class="text-xs bg-white/10 px-2 py-1 rounded"
          >
            {{ (locationItem as Country).code }}
          </span>
        </div>
      </template>
      <template #empty>
        <div class="p-2 text-center text-white/50">
          No results found
        </div>
      </template>
    </BaseAutocomplete>
  </div>
</template>
