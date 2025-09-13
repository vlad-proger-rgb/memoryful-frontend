<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Tag } from '@/types'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'

const props = defineProps<{
  modelValue: Tag[]
  availableTags: Tag[]
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const isDropdownOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const selectedTags = computed(() => props.modelValue || [])

const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) return props.availableTags

  const query = searchQuery.value.toLowerCase().trim()
  return props.availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query) && !selectedTags.value.some((t) => t.id === tag.id),
  )
})

const isTagSelected = (tag: Tag) => {
  return selectedTags.value.some((t) => t.id === tag.id)
}

const focusInput = () => {
  inputRef.value?.focus()
  isDropdownOpen.value = true
}

const selectTag = (tag: Tag) => {
  if (!isTagSelected(tag)) {
    const newTags = [...selectedTags.value, tag]
    emit('update:modelValue', newTags)
    searchQuery.value = ''
  }
  isDropdownOpen.value = false
  focusInput()
}

const removeTag = (tag: Tag) => {
  const newTags = selectedTags.value.filter((t) => t.id !== tag.id)
  emit('update:modelValue', newTags)
}

const handleEnter = (e?: Event) => {
  e?.preventDefault()

  if (filteredTags.value.length === 1) {
    selectTag(filteredTags.value[0])
  } else if (filteredTags.value.length > 1) {
    isDropdownOpen.value = true
  }
}

const handleBackspace = () => {
  if (!searchQuery.value && selectedTags.value.length > 0) {
    // Remove the last tag when backspace is pressed with empty input
    const newTags = [...selectedTags.value]
    newTags.pop()
    emit('update:modelValue', newTags)
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="containerRef">
    <div
      class="flex flex-wrap gap-2 p-2 min-h-12 border border-white/20 rounded-lg cursor-text"
      @click="focusInput"
    >
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm text-white/90"
      >
        {{ tag.name }}
        <button @click.stop="removeTag(tag)" class="text-white/50 hover:text-white/80">
          <font-awesome-icon icon="times" class="text-xs" />
        </button>
      </span>
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="flex-1 min-w-[100px] bg-transparent outline-none text-white placeholder-white/30"
        placeholder="Add tags..."
        @keydown.enter.prevent="handleEnter"
        @keydown.backspace="handleBackspace"
        @focus="isDropdownOpen = true"
      />
    </div>

    <BaseAutocomplete
      v-model:show="isDropdownOpen"
      :items="filteredTags"
      :attach-to="inputRef"
      item-key="id"
      item-label="name"
      class="z-50"
      @select="selectTag"
    >
      <template #item="{ item: tag }">
        <div class="flex items-center justify-between w-full">
          <span>{{ tag.name }}</span>
          <font-awesome-icon v-if="isTagSelected(tag)" icon="check" class="text-blue-400" />
        </div>
      </template>
      <template #empty>
        <div v-if="searchQuery" class="px-4 py-2 text-white/50 text-sm">
          No tags found. Press Enter to create "{{ searchQuery }}"
        </div>
      </template>
    </BaseAutocomplete>
  </div>
</template>
