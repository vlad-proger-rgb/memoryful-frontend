<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { tagsApi } from '@/api'
import trackablesApi from '@/api/trackables'
import trackableTypesApi from '@/api/trackable-types'
import BaseAutocomplete from '@/components/ui/BaseAutocomplete.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'
import SettingsInput from '@/components/ui/SettingsInput.vue'

import { useShake } from '@/composables'
import { useUiStore } from '@/stores/ui'
import type {
  ApiResponse,
  Tag,
  TrackableCreate,
  TrackableInDB,
  TrackableType,
  TrackableTypeCreate,
  TrackableTypeUpdate,
  TrackableUpdate,
} from '@/types'

const uiStore = useUiStore()
const { shakeElement } = useShake()

const normalizeHexColor = (value: string) => {
  const v = (value || '').trim()
  if (!v) return ''

  const withHash = v.startsWith('#') ? v : `#${v}`
  const full = /^#([0-9a-fA-F]{6})$/.test(withHash)
  const short = /^#([0-9a-fA-F]{3})$/.test(withHash)

  if (full) return withHash.toUpperCase()
  if (short) {
    const s = withHash.slice(1)
    const expanded = `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`
    return expanded.toUpperCase()
  }

  return ''
}

const getReadableTextColor = (hex: string) => {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return ''
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 160 ? '#0B0B0B' : '#FFFFFF'
}

const getErrorMessage = (e: unknown) => {
  if (e && typeof e === 'object' && 'msg' in e) {
    return String((e as ApiResponse).msg || 'Unknown error')
  }
  return 'Unknown error'
}

// -----------------------
// Tags
// -----------------------
const tags = ref<Tag[]>([])
const tagsLoading = ref(false)

const newTagName = ref('')
const newTagColor = ref('')

const isDuplicateNewTagName = computed(() => {
  const name = newTagName.value.trim().toLowerCase()
  if (!name) return false
  return tags.value.some((t) => (t.name || '').trim().toLowerCase() === name)
})

watch(
  () => isDuplicateNewTagName.value,
  (next, prev) => {
    if (next && !prev) {
      shakeElement('new-tag-name-container')
    }
  },
)

const loadTags = async () => {
  tagsLoading.value = true
  try {
    const res = await tagsApi.getTags()
    tags.value = res.data || []
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to load tags', 'error')
  } finally {
    tagsLoading.value = false
  }
}

const createTag = async () => {
  const name = newTagName.value.trim()
  if (!name) return

  try {
    const res = await tagsApi.createTag({ name, color: newTagColor.value.trim() || undefined })
    if (res.code === 200) {
      uiStore.showToast('Tag created', 'success')
      newTagName.value = ''
      newTagColor.value = ''
      await loadTags()
    } else {
      uiStore.showToast(res.msg || 'Failed to create tag', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to create tag', 'error')
  }
}

const updateTag = async (tag: Tag) => {
  try {
    const res = await tagsApi.updateTag(tag.id, { name: tag.name, color: tag.color, icon: tag.icon })
    if (res.code === 200) {
      uiStore.showToast('Tag saved', 'success')
      await loadTags()
    } else {
      uiStore.showToast(res.msg || 'Failed to save tag', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to save tag', 'error')
  }
}

const deleteTag = async (tag: Tag) => {
  const ok = window.confirm(`Delete tag "${tag.name}"?`)
  if (!ok) return

  try {
    const res = await tagsApi.deleteTag(tag.id)
    if (res.code === 200) {
      uiStore.showToast('Tag deleted', 'success')
      tags.value = tags.value.filter((t) => t.id !== tag.id)
    } else {
      uiStore.showToast(res.msg || 'Failed to delete tag', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to delete tag', 'error')
  }
}

// -----------------------
// Trackables
// -----------------------
const trackables = ref<TrackableInDB[]>([])
const trackablesLoading = ref(false)

const trackableTypes = ref<TrackableType[]>([])
const trackableTypesLoading = ref(false)

const trackableTypeDrafts = ref<Record<string, { name: string; description: string; valueType: string }>>({})

const newTrackableTypeName = ref('')
const newTrackableTypeDescription = ref('')
const newTrackableTypeValueType = ref('')

const newTrackableTitle = ref('')
const newTrackableDescription = ref('')
const newTrackableTypeId = ref('')

const addTypeDropdownOpen = ref(false)
const addTypeButtonRef = ref<HTMLElement | null>(null)

const loadTrackableTypes = async () => {
  trackableTypesLoading.value = true
  try {
    const res = await trackableTypesApi.getTrackableTypes()
    trackableTypes.value = res.data || []

    if (!newTrackableTypeId.value && trackableTypes.value.length) {
      newTrackableTypeId.value = trackableTypes.value[0].id
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to load trackable types', 'error')
  } finally {
    trackableTypesLoading.value = false
  }
}

const ensureTrackableTypeDraft = (tt: TrackableType) => {
  if (!trackableTypeDrafts.value[tt.id]) {
    trackableTypeDrafts.value[tt.id] = {
      name: tt.name || '',
      description: tt.description || '',
      valueType: tt.valueType || '',
    }
  }
  return trackableTypeDrafts.value[tt.id]
}

const createTrackableType = async () => {
  const name = newTrackableTypeName.value.trim()
  const valueType = newTrackableTypeValueType.value.trim()
  if (!name || !valueType) return

  const payload: TrackableTypeCreate = {
    name,
    description: newTrackableTypeDescription.value.trim() || undefined,
    valueType,
  }

  try {
    const res = await trackableTypesApi.createTrackableType(payload)
    if (res.code === 200) {
      uiStore.showToast('Trackable type created', 'success')
      newTrackableTypeName.value = ''
      newTrackableTypeDescription.value = ''
      newTrackableTypeValueType.value = ''
      await loadTrackableTypes()
    } else {
      uiStore.showToast(res.msg || 'Failed to create trackable type', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to create trackable type', 'error')
  }
}

const updateTrackableType = async (id: string, data: TrackableTypeUpdate) => {
  try {
    const res = await trackableTypesApi.updateTrackableType(id, data)
    if (res.code === 200) {
      uiStore.showToast('Trackable type saved', 'success')
      await loadTrackableTypes()
    } else {
      uiStore.showToast(res.msg || 'Failed to save trackable type', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to save trackable type', 'error')
  }
}

const deleteTrackableType = async (tt: TrackableType) => {
  const ok = window.confirm(`Delete trackable type "${tt.name}"?`)
  if (!ok) return

  try {
    const res = await trackableTypesApi.deleteTrackableType(tt.id)
    if (res.code === 200) {
      uiStore.showToast('Trackable type deleted', 'success')
      trackableTypes.value = trackableTypes.value.filter((x) => x.id !== tt.id)
      if (newTrackableTypeId.value === tt.id) {
        newTrackableTypeId.value = trackableTypes.value[0]?.id || ''
      }
    } else {
      uiStore.showToast(res.msg || 'Failed to delete trackable type', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to delete trackable type', 'error')
  }
}

const loadTrackables = async () => {
  trackablesLoading.value = true
  try {
    const res = await trackablesApi.getTrackables()
    trackables.value = res.data || []
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to load trackables', 'error')
  } finally {
    trackablesLoading.value = false
  }
}

const createTrackable = async () => {
  const title = newTrackableTitle.value.trim()
  const typeId = newTrackableTypeId.value
  if (!title || !typeId) return

  const payload: TrackableCreate = {
    title,
    description: newTrackableDescription.value.trim() || undefined,
    typeId,
  }

  try {
    const res = await trackablesApi.createTrackable(payload)
    if (res.code === 200) {
      uiStore.showToast('Trackable created', 'success')
      newTrackableTitle.value = ''
      newTrackableDescription.value = ''
      await loadTrackables()
    } else {
      uiStore.showToast(res.msg || 'Failed to create trackable', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to create trackable', 'error')
  }
}

const updateTrackable = async (id: string, data: TrackableUpdate) => {
  try {
    const res = await trackablesApi.updateTrackable(id, data)
    if (res.code === 200) {
      uiStore.showToast('Trackable saved', 'success')
      await loadTrackables()
    } else {
      uiStore.showToast(res.msg || 'Failed to save trackable', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to save trackable', 'error')
  }
}

const deleteTrackable = async (t: TrackableInDB) => {
  const ok = window.confirm(`Delete trackable "${t.title}"?`)
  if (!ok) return

  try {
    const res = await trackablesApi.deleteTrackable(t.id)
    if (res.code === 200) {
      uiStore.showToast('Trackable deleted', 'success')
      trackables.value = trackables.value.filter((x) => x.id !== t.id)
    } else {
      uiStore.showToast(res.msg || 'Failed to delete trackable', 'error')
    }
  } catch (e: unknown) {
    uiStore.showToast(getErrorMessage(e) || 'Failed to delete trackable', 'error')
  }
}

const trackableDrafts = ref<Record<string, { title: string; description: string }>>({})
const trackableItemTypeDrafts = ref<Record<string, string>>({})
const trackableTypeDropdownOpen = ref<Record<string, boolean>>({})

const ensureTrackableDraft = (t: TrackableInDB) => {
  if (!trackableDrafts.value[t.id]) {
    trackableDrafts.value[t.id] = {
      title: t.title || '',
      description: t.description || '',
    }
  }
  return trackableDrafts.value[t.id]
}

const ensureTrackableItemTypeDraft = (t: TrackableInDB) => {
  if (!trackableItemTypeDrafts.value[t.id]) {
    trackableItemTypeDrafts.value[t.id] = t.typeId
  }
  return trackableItemTypeDrafts.value[t.id]
}

const saveTrackableDraft = async (t: TrackableInDB) => {
  const draft = ensureTrackableDraft(t)
  const typeId = ensureTrackableItemTypeDraft(t)
  await updateTrackable(t.id, {
    title: draft.title.trim() || undefined,
    description: draft.description.trim() || undefined,
    typeId: typeId || undefined,
  })
}

onMounted(async () => {
  await Promise.all([loadTags(), loadTrackableTypes(), loadTrackables()])
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <p class="text-xl font-semibold">Tags & Trackables</p>
      <p class="text-sm opacity-80">Create and manage reusable tags and trackables.</p>
    </div>

    <!-- Tags -->
    <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl px-6 py-4 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-lg font-semibold">Tags</p>
          <p class="text-xs opacity-80">Used for organizing days and search filters.</p>
        </div>
        <SettingsButton preset="refresh" :disabled="tagsLoading" @click="loadTags" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="md:col-span-1">
          <div id="new-tag-name-container">
            <SettingsInput
              v-model="newTagName"
              type="text"
              placeholder="New tag name"
              @keydown.enter.prevent="createTag"
            />
          </div>
          <p v-if="isDuplicateNewTagName" class="text-xs text-red-300 mt-1">
            A tag with this name already exists.
          </p>
        </div>
        <div class="md:col-span-2 flex flex-wrap gap-2">
          <label
            class="group relative w-10 h-10 shrink-0 rounded-xl border border-white/15 overflow-hidden cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.03] hover:ring-2 hover:ring-white/30 active:scale-[0.98] focus-within:ring-2 focus-within:ring-blue-400/50"
            :class="!newTagName.trim() ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:ring-0' : ''"
            title="Pick a color"
          >
            <span
              class="absolute inset-0 transition-[filter] duration-150 ease-out group-hover:brightness-110"
              :style="{ backgroundColor: normalizeHexColor(newTagColor) || 'rgba(0,0,0,0.2)' }"
            />
            <input
              v-model="newTagColor"
              type="color"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              :disabled="!newTagName.trim()"
            />
          </label>
          <input
            v-model="newTagColor"
            type="text"
            class="flex-1 min-w-[160px] border border-white/15 rounded-xl px-3 py-2 outline-none text-sm"
            :style="{
              backgroundColor: normalizeHexColor(newTagColor) || 'rgba(0,0,0,0.2)',
              color: getReadableTextColor(newTagColor) || '',
            }"
            placeholder="#RRGGBB (optional)"
            @keydown.enter.prevent="createTag"
          />
          <SettingsButton
            preset="compact"
            label="Add"
            icon="plus"
            :disabled="!newTagName.trim() || isDuplicateNewTagName"
            @click="createTag"
          />
        </div>
      </div>

      <div v-if="tagsLoading" class="text-sm opacity-80">Loading…</div>
      <div v-else-if="!tags.length" class="text-sm opacity-80">No tags yet.</div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="t in tags"
          :key="t.id"
          class="bg-black/15 border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row md:items-end gap-3"
        >
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p class="text-xs opacity-70 mb-1">Name</p>
              <SettingsInput v-model="t.name" type="text" />
            </div>
            <div>
              <p class="text-xs opacity-70 mb-1">Color</p>
              <div class="flex gap-2">
                <label
                  class="group relative w-10 h-10 shrink-0 rounded-xl border border-white/15 overflow-hidden cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.03] hover:ring-2 hover:ring-white/30 active:scale-[0.98] focus-within:ring-2 focus-within:ring-blue-400/50"
                  title="Pick a color"
                >
                  <span
                    class="absolute inset-0 transition-[filter] duration-150 ease-out group-hover:brightness-110"
                    :style="{ backgroundColor: normalizeHexColor(t.color || '') || 'rgba(0,0,0,0.2)' }"
                  />
                  <input v-model="t.color" type="color" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </label>
                <input
                  v-model="t.color"
                  type="text"
                  class="w-full border border-white/15 rounded-xl px-3 py-2 outline-none text-sm"
                  :style="{
                    backgroundColor: normalizeHexColor(t.color || '') || 'rgba(0,0,0,0.2)',
                    color: getReadableTextColor(t.color || '') || '',
                  }"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2">
            <SettingsButton preset="pill" label="Save" icon="floppy-disk" @click="updateTag(t)" />
            <SettingsButton preset="pill" tone="danger" label="Delete" icon="trash" @click="deleteTag(t)" />
          </div>
        </div>
      </div>
    </section>

    <!-- Trackable types -->
    <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl px-6 py-4 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-lg font-semibold">Trackable types</p>
          <p class="text-xs opacity-80">Create and manage your personal trackable types.</p>
        </div>
        <SettingsButton preset="refresh" :disabled="trackableTypesLoading" @click="loadTrackableTypes" />
      </div>

      <div class="flex flex-col gap-3">
        <div class="bg-black/15 border border-white/10 rounded-2xl p-3">
          <div class="flex flex-col md:flex-row gap-3 md:items-end">
            <div class="shrink-0">
              <SettingsButton
                preset="compact"
                label="Add"
                icon="plus"
                :disabled="!newTrackableTypeName.trim() || !newTrackableTypeValueType.trim()"
                @click="createTrackableType"
              />
            </div>

            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p class="text-xs opacity-70 mb-1">Name</p>
                <SettingsInput
                  v-model="newTrackableTypeName"
                  type="text"
                  placeholder="e.g. learning"
                  @keydown.enter.prevent="createTrackableType"
                />
              </div>
              <div>
                <p class="text-xs opacity-70 mb-1">Value type</p>
                <SettingsInput
                  v-model="newTrackableTypeValueType"
                  type="text"
                  placeholder="e.g. minutes, km"
                  @keydown.enter.prevent="createTrackableType"
                />
              </div>
              <div>
                <p class="text-xs opacity-70 mb-1">Description</p>
                <SettingsInput
                  v-model="newTrackableTypeDescription"
                  type="text"
                  placeholder="Optional"
                  @keydown.enter.prevent="createTrackableType"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="trackableTypesLoading" class="text-sm opacity-80">Loading…</div>
        <div v-else-if="!trackableTypes.length" class="text-sm opacity-80">No trackable types yet.</div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="tt in trackableTypes"
            :key="tt.id"
            class="bg-black/15 border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row gap-3 md:items-end"
          >
            <div class="shrink-0 flex items-center gap-2">
              <SettingsButton
                preset="pill"
                label="Save"
                icon="floppy-disk"
                @click="updateTrackableType(tt.id, {
                  name: ensureTrackableTypeDraft(tt).name.trim() || undefined,
                  description: ensureTrackableTypeDraft(tt).description.trim() || undefined,
                  valueType: ensureTrackableTypeDraft(tt).valueType.trim() || undefined,
                })"
              />
              <SettingsButton
                preset="pill"
                tone="danger"
                label="Delete"
                icon="trash"
                @click="deleteTrackableType(tt)"
              />
            </div>

            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p class="text-xs opacity-70 mb-1">Name</p>
                <SettingsInput v-model="ensureTrackableTypeDraft(tt).name" type="text" />
              </div>
              <div>
                <p class="text-xs opacity-70 mb-1">Value type</p>
                <SettingsInput v-model="ensureTrackableTypeDraft(tt).valueType" type="text" />
              </div>
              <div>
                <p class="text-xs opacity-70 mb-1">Description</p>
                <SettingsInput v-model="ensureTrackableTypeDraft(tt).description" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trackables -->
    <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl px-6 py-4 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-lg font-semibold">Trackables</p>
          <p class="text-xs opacity-80">Reusable items for tracking progress on days.</p>
        </div>
        <SettingsButton preset="refresh" :disabled="trackablesLoading" @click="loadTrackables" />
      </div>

      <div v-if="trackableTypesLoading" class="text-sm opacity-80">Loading trackable types…</div>

      <div class="bg-black/15 border border-white/10 rounded-2xl p-3">
        <div class="flex flex-col md:flex-row gap-3 md:items-end">
          <div class="shrink-0">
            <SettingsButton
              preset="compact"
              label="Add"
              icon="plus"
              :disabled="!newTrackableTitle.trim() || !newTrackableTypeId"
              @click="createTrackable"
            />
          </div>

          <div class="flex-1 flex flex-wrap items-end gap-3">
            <div class="w-full md:w-[240px]">
              <p class="text-xs opacity-70 mb-1">Type</p>
              <div class="relative">
                <button
                  ref="addTypeButtonRef"
                  type="button"
                  class="w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none text-sm flex items-center justify-between gap-2"
                  @click="addTypeDropdownOpen = !addTypeDropdownOpen"
                >
                  <span class="truncate">
                    {{ trackableTypes.find((x) => x.id === newTrackableTypeId)?.name || 'Select type' }}
                  </span>
                  <font-awesome-icon icon="chevron-down" class="opacity-70" />
                </button>

                <BaseAutocomplete
                  v-model:show="addTypeDropdownOpen"
                  :items="trackableTypes"
                  :attach-to="addTypeButtonRef"
                  item-key="id"
                  item-label="name"
                  class="z-50"
                  @select="(tt) => {
                    newTrackableTypeId = tt.id
                    addTypeDropdownOpen = false
                  }"
                />
              </div>
            </div>

            <div class="flex-1 min-w-[220px] md:min-w-[260px]">
              <p class="text-xs opacity-70 mb-1">Title</p>
              <SettingsInput
                v-model="newTrackableTitle"
                type="text"
                placeholder="e.g. Reading"
                @keydown.enter.prevent="createTrackable"
              />
            </div>

            <div class="flex-[2] min-w-[220px]">
              <p class="text-xs opacity-70 mb-1">Description</p>
              <SettingsInput
                v-model="newTrackableDescription"
                type="text"
                placeholder="Optional"
                @keydown.enter.prevent="createTrackable"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="trackablesLoading" class="text-sm opacity-80">Loading…</div>
      <div v-else-if="!trackables.length" class="text-sm opacity-80">No trackables yet.</div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="t in trackables"
          :key="t.id"
          class="bg-black/15 border border-white/10 rounded-2xl p-3 flex flex-col gap-3"
        >
          <div class="flex flex-col md:flex-row gap-3 md:items-end">
            <div class="shrink-0 flex items-center gap-2 md:order-2 md:ml-auto">
              <SettingsButton preset="pill" label="Save" icon="floppy-disk" @click="saveTrackableDraft(t)" />
              <SettingsButton preset="pill" tone="danger" label="Delete" icon="trash" @click="deleteTrackable(t)" />
            </div>

            <div class="flex-1 flex flex-wrap items-end gap-3">
              <div class="w-full md:w-[240px]">
                <p class="text-xs opacity-70 mb-1">Type</p>
                <div class="relative">
                  <button
                    type="button"
                    class="w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none text-sm flex items-center justify-between gap-2"
                    @click="trackableTypeDropdownOpen[t.id] = true"
                  >
                    <span class="truncate">
                      {{ trackableTypes.find((x) => x.id === ensureTrackableItemTypeDraft(t))?.name || 'Select type' }}
                    </span>
                    <font-awesome-icon icon="chevron-down" class="opacity-70" />
                  </button>

                  <BaseAutocomplete
                    :show="trackableTypeDropdownOpen[t.id] || false"
                    @update:show="(v) => (trackableTypeDropdownOpen[t.id] = v)"
                    :items="trackableTypes"
                    item-key="id"
                    item-label="name"
                    class="z-50"
                    @select="(tt) => {
                      trackableItemTypeDrafts[t.id] = tt.id
                      trackableTypeDropdownOpen[t.id] = false
                    }"
                  />
                </div>
              </div>

              <div class="flex-1 min-w-[220px] md:min-w-[260px]">
                <p class="text-xs opacity-70 mb-1">Title</p>
                <SettingsInput v-model="ensureTrackableDraft(t).title" type="text" />
              </div>

              <div class="flex-[2] min-w-[220px]">
                <p class="text-xs opacity-70 mb-1">Description</p>
                <SettingsInput v-model="ensureTrackableDraft(t).description" type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs opacity-70">Tip: You can change a trackable`s type and click Save to apply.</p>
    </section>
  </div>
</template>
