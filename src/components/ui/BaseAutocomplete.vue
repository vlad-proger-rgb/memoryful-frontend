<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useAnchoredPosition } from '@/composables/useAnchoredPosition'

type ItemWithId = { id: string | number } & Record<string, unknown>

const props = withDefaults(
  defineProps<{
    items: T[]
    itemKey?: string
    itemLabel?: string
    maxHeight?: string
    show: boolean
    loading?: boolean
    attachTo?: string | HTMLElement | null
    searchable?: boolean
    minWidth?: string
  }>(),
  {
    itemKey: 'id',
    itemLabel: 'name',
    maxHeight: '200px',
    loading: false,
    attachTo: null,
    searchable: false,
    minWidth: '200px',
  },
)

const emit = defineEmits<{
  (e: 'select', item: T): void
  (e: 'update:show', value: boolean): void
}>()

const dropdownRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(-1)

const naturalHeight = () => {
  const listMax = parseInt(props.maxHeight, 10) || 200
  if (!dropdownRef.value || !menuRef.value) return listMax

  // The menu shrinks to whatever cap the last run applied, so only its scrollHeight
  // still reports the list's real size; measuring the panel would ratchet downward.
  const chrome = dropdownRef.value.offsetHeight - menuRef.value.offsetHeight
  return Math.min(menuRef.value.scrollHeight, listMax) + chrome
}

const { style: dropdownStyle, updatePosition } = useAnchoredPosition(
  () => (props.attachTo instanceof HTMLElement ? props.attachTo : containerRef.value),
  () => ({
    width: 'anchor',
    minWidth: parseInt(props.minWidth, 10) || 0,
    maxHeight: naturalHeight(),
  }),
)

const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) return props.items
  const q = searchQuery.value.toLowerCase()
  return props.items.filter((item) =>
    String(item[props.itemLabel as keyof T])
      .toLowerCase()
      .includes(q),
  )
})

const selectItem = (item: T) => {
  emit('select', item)
  emit('update:show', false)
  selectedIndex.value = -1
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.show) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1)
      scrollToSelected()
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      scrollToSelected()
      break
    case 'Enter':
      if (selectedIndex.value >= 0) {
        e.preventDefault()
        selectItem(filteredItems.value[selectedIndex.value])
      }
      break
    case 'Escape':
      emit('update:show', false)
      break
  }
}

const scrollToSelected = () => {
  if (!dropdownRef.value || selectedIndex.value < 0) return

  const items = dropdownRef.value.querySelectorAll('.autocomplete-item')
  const selectedItem = items[selectedIndex.value] as HTMLElement

  if (selectedItem) {
    selectedItem.scrollIntoView({
      block: 'nearest',
    })
  }
}

const onMouseEnterItem = (index: number) => {
  selectedIndex.value = index
}

// Close dropdown when clicking outside
const onClickOutside = (event: MouseEvent) => {
  const targetNode = event.target as Node
  const attachTarget = props.attachTo instanceof HTMLElement ? props.attachTo : null

  const clickedInsideDropdown = !!dropdownRef.value && dropdownRef.value.contains(targetNode)
  const clickedInsideAttachTo = !!attachTarget && attachTarget.contains(targetNode)
  const clickedInsideContainer = !!containerRef.value && containerRef.value.contains(targetNode)

  if (!clickedInsideDropdown && !clickedInsideAttachTo && !clickedInsideContainer) {
    emit('update:show', false)
  }
}

watch(
  () => props.show,
  async (isVisible) => {
    if (isVisible) {
      searchQuery.value = ''
      await nextTick()
      updatePosition()
      // The first pass sets the width; only then does scrollHeight reflect the real wrapping.
      await nextTick()
      updatePosition()
      selectedIndex.value = -1
      searchInput.value?.focus()
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', onClickOutside, { capture: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', onClickOutside, { capture: true })
})

defineExpose({
  scrollToSelected,
  updatePosition,
})
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <Teleport to="body">
      <Transition name="autocomplete">
        <div v-if="show" ref="dropdownRef" class="autocomplete-dropdown" :style="dropdownStyle">
          <div ref="menuRef" class="autocomplete-menu" :style="{ maxHeight }">
            <div v-if="searchable" class="p-2 border-b border-white/10">
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Search models..."
                class="w-full bg-white/10 text-white placeholder:text-white/40 text-base md:text-xs rounded px-2 py-2 md:py-1.5 outline-none focus:ring-1 focus:ring-fuchsia-400"
                @click.stop
              />
            </div>
            <div v-if="loading" class="p-2 text-center text-gray-400">Loading...</div>
            <div v-else-if="filteredItems.length > 0">
              <div
                v-for="(item, index) in filteredItems"
                :key="String((item as ItemWithId)[itemKey] || index)"
                class="autocomplete-item"
                :class="{ 'bg-white/10': selectedIndex === index }"
                @mousedown.prevent="selectItem(item)"
                @mouseenter="onMouseEnterItem(index)"
              >
                <slot name="item" :item="item" :index="index">
                  {{ item[itemLabel as keyof typeof item] }}
                </slot>
              </div>
            </div>
            <div v-else-if="$slots.empty" class="p-2">
              <slot name="empty"></slot>
            </div>
            <div v-else class="p-2 text-center text-gray-400 text-xs">No matches</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.autocomplete-enter-active {
  transition:
    opacity 120ms ease,
    transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
}

.autocomplete-leave-active {
  transition:
    opacity 90ms ease,
    transform 90ms ease;
}

.autocomplete-enter-from,
.autocomplete-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .autocomplete-enter-active,
  .autocomplete-leave-active {
    transition-duration: 1ms;
  }

  .autocomplete-enter-from,
  .autocomplete-leave-to {
    transform: none;
  }
}

.autocomplete-dropdown {
  transform-origin: top left;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(31 41 55);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.autocomplete-menu {
  position: relative;
  width: 100%;
  min-height: 0;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 0.5rem;
  outline: 2px solid transparent;
  outline-offset: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.autocomplete-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: white;
  cursor: pointer;
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow,
    transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.autocomplete-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Custom scrollbar */
.autocomplete-menu::-webkit-scrollbar {
  width: 0.375rem;
}

.autocomplete-menu::-webkit-scrollbar-track {
  background-color: transparent;
}

.autocomplete-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

.autocomplete-menu::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
