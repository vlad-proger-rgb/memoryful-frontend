<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { FAIcon, IconStyle, Tag } from '@/types'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'
import IconSelector from '@/components/ui/IconSelector.vue'
import { tagsApi } from '@/api'

const props = defineProps<{
  modelValue: Tag[]
  availableTags: Tag[]
  allowCreate?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Tag[]): void
  (e: 'tag-created', tag: Tag): void
}>()

const CREATE_ID = '__create__'

const searchQuery = ref('')
const isDropdownOpen = ref(false)
const isCreating = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const showCreateForm = ref(false)
const createFormName = ref('')
const createFormColor = ref('')
const createFormIcon = ref<FAIcon | undefined>(undefined)
const iconSelectorOpen = ref(false)
const iconButtonRef = ref<HTMLElement | null>(null)

const selectedTags = computed(() => props.modelValue || [])

const filteredTagsWithCreate = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) {
    return props.availableTags.filter((t) => !selectedTags.value.some((s) => s.id === t.id))
  }
  const lower = query.toLowerCase()
  const matches = props.availableTags.filter(
    (t) => t.name.toLowerCase().includes(lower) && !selectedTags.value.some((s) => s.id === t.id),
  )
  if (props.allowCreate) {
    const exactMatch = props.availableTags.some((t) => t.name.toLowerCase() === lower)
    if (!exactMatch) {
      return [...matches, { id: CREATE_ID, name: query } as Tag]
    }
  }
  return matches
})

const isTagSelected = (tag: Tag) => {
  return selectedTags.value.some((t) => t.id === tag.id)
}

const openCreateForm = (name: string) => {
  createFormName.value = name
  createFormColor.value = ''
  createFormIcon.value = undefined
  showCreateForm.value = true
  isDropdownOpen.value = false
  searchQuery.value = ''
}

const cancelCreateForm = () => {
  showCreateForm.value = false
  createFormName.value = ''
  createFormColor.value = ''
  createFormIcon.value = undefined
}

const setCreateFormIcon = (iconName: string, iconStyle: IconStyle = 'fas') => {
  createFormIcon.value = iconName.trim() ? { name: iconName, style: iconStyle } : undefined
}

const submitCreateForm = async () => {
  const name = createFormName.value.trim()
  if (!name) return
  isCreating.value = true
  try {
    const res = await tagsApi.createTag({
      name,
      color: createFormColor.value.trim() || undefined,
      icon: createFormIcon.value,
    })
    if (res.data) {
      const newTag: Tag = {
        id: res.data,
        name,
        color: createFormColor.value.trim() || undefined,
        icon: createFormIcon.value,
      }
      emit('update:modelValue', [...selectedTags.value, newTag])
      emit('tag-created', newTag)
      cancelCreateForm()
      focusInput()
    }
  } finally {
    isCreating.value = false
  }
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

const handleSelect = (tag: Tag) => {
  if (tag.id === CREATE_ID) {
    openCreateForm(tag.name)
    return
  }
  selectTag(tag)
}

const removeTag = (tag: Tag) => {
  const newTags = selectedTags.value.filter((t) => t.id !== tag.id)
  emit('update:modelValue', newTags)
}

const handleEnter = (e?: Event) => {
  e?.preventDefault()

  if (filteredTagsWithCreate.value.length === 1) {
    handleSelect(filteredTagsWithCreate.value[0])
  } else if (filteredTagsWithCreate.value.length > 1) {
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
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-white/90"
        :style="{
          backgroundColor: tag.color ? `${tag.color}33` : 'rgba(255,255,255,0.1)',
        }"
      >
        <span
          v-if="tag.color"
          class="w-2.5 h-2.5 rounded-full border border-white/30"
          :style="{ backgroundColor: tag.color }"
        />
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

    <div
      v-if="showCreateForm"
      class="mt-2 p-3 rounded-lg border border-blue-400/30 bg-blue-500/10 flex flex-col gap-3"
    >
      <p class="text-xs text-blue-200 font-medium">New tag</p>

      <div class="flex flex-col gap-2">
        <input
          v-model="createFormName"
          type="text"
          class="w-full px-3 py-2 md:py-1.5 bg-white/5 border border-white/10 rounded-md text-white text-base md:text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Tag name"
        />

        <div class="flex items-center gap-2">
          <label class="text-xs text-white/50 shrink-0">Color</label>
          <input
            v-model="createFormColor"
            type="color"
            class="size-11 md:size-7 rounded cursor-pointer bg-transparent border border-white/20"
          />
          <button
            v-if="createFormColor"
            type="button"
            class="text-xs text-white/40 hover:text-white/70"
            @click="createFormColor = ''"
          >
            Clear
          </button>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-xs text-white/50 shrink-0">Icon</label>
          <button
            ref="iconButtonRef"
            type="button"
            class="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white/90 hover:bg-white/10"
            @click="iconSelectorOpen = !iconSelectorOpen"
          >
            <font-awesome-icon
              v-if="createFormIcon"
              :icon="[createFormIcon.style, createFormIcon.name]"
              class="text-xs"
            />
            <span>{{ createFormIcon ? createFormIcon.name : 'Choose icon' }}</span>
          </button>
          <button
            v-if="createFormIcon"
            type="button"
            class="text-xs text-white/40 hover:text-white/70"
            @click="setCreateFormIcon('')"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-3 py-1 text-xs text-white/60 hover:text-white/90 rounded border border-white/10 hover:bg-white/10"
          @click="cancelCreateForm"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isCreating || !createFormName.trim()"
          class="px-3 py-1 text-xs text-white rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          @click="submitCreateForm"
        >
          <font-awesome-icon v-if="isCreating" icon="spinner" spin class="text-xs" />
          Create
        </button>
      </div>

      <IconSelector
        v-model:show="iconSelectorOpen"
        :attach-to="iconButtonRef"
        @update:model-value="(name) => setCreateFormIcon(name)"
        @update:model-style="(style) => createFormIcon && (createFormIcon.style = style)"
      />
    </div>

    <BaseAutocomplete
      v-model:show="isDropdownOpen"
      :items="filteredTagsWithCreate"
      :attach-to="inputRef"
      :loading="isCreating"
      item-key="id"
      item-label="name"
      class="z-50"
      @select="handleSelect"
    >
      <template #item="{ item: tag }">
        <div v-if="tag.id === CREATE_ID" class="flex items-center gap-2 text-blue-300">
          <font-awesome-icon icon="plus" class="shrink-0 text-xs" />
          <span>
            Create "
            <strong>{{ tag.name }}</strong>
            "
          </span>
        </div>
        <div v-else class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <span
              class="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
              :style="{ backgroundColor: tag.color || 'rgba(255,255,255,0.3)' }"
            />
            <span>{{ tag.name }}</span>
          </div>
          <font-awesome-icon v-if="isTagSelected(tag)" icon="check" class="text-blue-400" />
        </div>
      </template>
      <template #empty>
        <div class="px-4 py-2 text-white/50 text-sm">No tags found</div>
      </template>
    </BaseAutocomplete>
  </div>
</template>
