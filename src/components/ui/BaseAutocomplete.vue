<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'

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
  }>(),
  {
    itemKey: 'id',
    itemLabel: 'name',
    maxHeight: '200px',
    loading: false,
    attachTo: null,
  },
)

const emit = defineEmits<{
  (e: 'select', item: T): void
  (e: 'update:show', value: boolean): void
}>()

const dropdownRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const selectedIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})

const filteredItems = computed(() => props.items)

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

const updatePosition = () => {
  const target = props.attachTo instanceof HTMLElement
    ? props.attachTo
    : containerRef.value

  if (!target) return

  const rect = target.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
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
      await nextTick()
      updatePosition()
      selectedIndex.value = -1
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', onClickOutside, { capture: true })
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', onClickOutside, { capture: true })
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

defineExpose({
  scrollToSelected,
  updatePosition,
})
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <Teleport to="body">
      <div v-if="show" ref="dropdownRef" class="autocomplete-dropdown" :style="dropdownStyle">
        <div v-if="loading" class="autocomplete-menu" :style="{ maxHeight }">
          <div class="p-2 text-center text-gray-400">Loading...</div>
        </div>
        <div v-else-if="filteredItems.length > 0" class="autocomplete-menu" :style="{ maxHeight }">
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
        <div v-else-if="$slots.empty" class="autocomplete-menu" :style="{ maxHeight }">
          <slot name="empty"></slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.autocomplete-dropdown {
  z-index: 9999;
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
