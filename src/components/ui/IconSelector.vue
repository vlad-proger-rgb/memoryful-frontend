<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { onKeyStroke, onClickOutside, useEventListener, useDebounceFn } from '@vueuse/core'
import type { IconStyle } from '@/types/fontawesome'

interface IconItem {
  name: string
  icon: string
  prefix: IconStyle
  displayName: string
}

const props = withDefaults(
  defineProps<{
    show: boolean
    attachTo?: HTMLElement | null
    modelValue?: string
  }>(),
  {
    attachTo: null,
    modelValue: '',
  },
)

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:modelValue', value: string): void
  (e: 'update:modelStyle', value: IconStyle): void
  (e: 'select', icon: string, style: IconStyle): void
}>()

const selectorRef = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedIndex = ref(-1)
const selectorStyle = ref<Record<string, string>>({})

const updateDebouncedSearch = useDebounceFn(() => {
  debouncedSearchQuery.value = searchQuery.value
}, 150)

const allIcons = computed<IconItem[]>(() => {
  const icons: IconItem[] = []

  Object.values(fas).forEach((icon) => {
    if (icon && typeof icon === 'object' && 'iconName' in icon && typeof icon.iconName === 'string') {
      icons.push({
        name: icon.iconName,
        icon: icon.iconName,
        prefix: 'fas',
        displayName: icon.iconName.replace(/-/g, ' '),
      })
    }
  })

  Object.values(far).forEach((icon) => {
    if (icon && typeof icon === 'object' && 'iconName' in icon && typeof icon.iconName === 'string') {
      icons.push({
        name: icon.iconName,
        icon: icon.iconName,
        prefix: 'far',
        displayName: icon.iconName.replace(/-/g, ' '),
      })
    }
  })

  Object.values(fab).forEach((icon) => {
    if (icon && typeof icon === 'object' && 'iconName' in icon && typeof icon.iconName === 'string') {
      icons.push({
        name: icon.iconName,
        icon: icon.iconName,
        prefix: 'fab',
        displayName: icon.iconName.replace(/-/g, ' '),
      })
    }
  })

  // Don't deduplicate - keep all icons including brands
  return icons.sort((a, b) => {
    // Sort by name, then by prefix (fas, far, fab)
    const nameCompare = a.name.localeCompare(b.name)
    if (nameCompare !== 0) return nameCompare
    return a.prefix.localeCompare(b.prefix)
  })
})

const filteredIcons = computed(() => {
  const query = debouncedSearchQuery.value.toLowerCase().trim()

  if (!query) {
    // Show only first 200 icons initially for performance
    return allIcons.value.slice(0, 200)
  }

  return allIcons.value.filter(icon =>
    icon.name.includes(query) ||
    icon.displayName.includes(query)
  )
})

const selectIcon = (icon: IconItem) => {
  emit('update:modelValue', icon.name)
  emit('update:modelStyle', icon.prefix)
  emit('select', icon.name, icon.prefix)
  emit('update:show', false)
  searchQuery.value = ''
  selectedIndex.value = -1
}

onKeyStroke('ArrowDown', (e) => {
  if (!props.show) return
  e.preventDefault()
  selectedIndex.value = Math.min(selectedIndex.value + 1, filteredIcons.value.length - 1)
  scrollToSelected()
})

onKeyStroke('ArrowUp', (e) => {
  if (!props.show) return
  e.preventDefault()
  selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  scrollToSelected()
})

onKeyStroke('ArrowRight', (e) => {
  if (!props.show) return
  e.preventDefault()
  selectedIndex.value = Math.min(selectedIndex.value + 8, filteredIcons.value.length - 1)
  scrollToSelected()
})

onKeyStroke('ArrowLeft', (e) => {
  if (!props.show) return
  e.preventDefault()
  selectedIndex.value = Math.max(selectedIndex.value - 8, -1)
  scrollToSelected()
})

onKeyStroke('Enter', (e) => {
  if (!props.show) return
  if (selectedIndex.value >= 0 && filteredIcons.value[selectedIndex.value]) {
    e.preventDefault()
    selectIcon(filteredIcons.value[selectedIndex.value])
  }
})

onKeyStroke('Escape', (e) => {
  if (!props.show) return
  e.preventDefault()
  emit('update:show', false)
  searchQuery.value = ''
})

const scrollToSelected = () => {
  if (!selectorRef.value || selectedIndex.value < 0) return

  const items = selectorRef.value.querySelectorAll('.icon-item')
  const selectedItem = items[selectedIndex.value] as HTMLElement

  if (selectedItem) {
    selectedItem.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    })
  }
}

const updatePosition = () => {
  const target = props.attachTo
  if (!target) return

  const rect = target.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top

  const selectorHeight = 420
  const shouldOpenAbove = spaceBelow < selectorHeight && spaceAbove > spaceBelow

  if (shouldOpenAbove) {
    selectorStyle.value = {
      position: 'fixed',
      bottom: `${viewportHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
      width: '380px',
      maxHeight: `${Math.min(400, spaceAbove - 20)}px`,
    }
  } else {
    selectorStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: '380px',
      maxHeight: `${Math.min(400, spaceBelow - 20)}px`,
    }
  }
}

onClickOutside(selectorRef, (event) => {
  if (!props.show) return
  const attachTarget = props.attachTo
  const clickedInsideAttachTo = !!attachTarget && attachTarget.contains(event.target as Node)

  if (!clickedInsideAttachTo) {
    emit('update:show', false)
    searchQuery.value = ''
  }
})

useEventListener('resize', updatePosition)
useEventListener('scroll', updatePosition, { capture: true })

watch(
  () => props.show,
  async (isVisible) => {
    if (isVisible) {
      await nextTick()
      updatePosition()
      selectedIndex.value = -1
      searchQuery.value = ''
      await nextTick()
      searchInput.value?.focus()
    }
  },
)

watch(searchQuery, () => {
  selectedIndex.value = -1
  updateDebouncedSearch()
})

watch(debouncedSearchQuery, () => {
  selectedIndex.value = -1
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="selectorRef"
      class="fixed z-[9999] flex flex-col backdrop-blur-[20px] bg-gray-800/85 rounded-2xl border border-white/15 shadow-[0_20px_25px_-5px_rgb(0_0_0/0.3),0_8px_10px_-6px_rgb(0_0_0/0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden"
      :style="selectorStyle"
    >
      <div class="p-4 border-b border-white/10 bg-black/15">
        <div class="relative flex items-center">
          <font-awesome-icon icon="search" class="absolute left-3.5 text-white/50 text-sm pointer-events-none" />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search icons..."
            class="w-full py-2.5 px-10 bg-black/25 border border-white/15 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/40 focus:bg-black/30 focus:border-blue-400/50 focus:ring-[3px] focus:ring-blue-400/10"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 flex items-center justify-center w-6 h-6 bg-white/10 border-none rounded-md text-white/70 cursor-pointer transition-all duration-150 hover:bg-white/15 hover:text-white"
            @click="searchQuery = ''"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
        <div v-if="filteredIcons.length === 0" class="flex flex-col items-center justify-center py-12 px-4 gap-3">
          <font-awesome-icon icon="search" class="text-[2.5rem] text-white/20" />
          <p class="text-white/50 text-sm">No icons found</p>
        </div>

        <div v-else class="grid grid-cols-8 gap-1.5">
          <div
            v-for="(icon, index) in filteredIcons"
            :key="`${icon.prefix}-${icon.name}-${index}`"
            class="aspect-square flex items-center justify-center bg-black/20 border border-white/10 rounded-lg cursor-pointer transition-all duration-150 relative group hover:bg-blue-400/15 hover:border-blue-400/30 hover:scale-105 active:scale-95"
            :class="selectedIndex === index ? 'bg-blue-400/20 border-blue-400/40 shadow-[0_0_0_2px_rgba(96,165,250,0.2)]' : ''"
            :title="`${icon.displayName} (${icon.prefix})`"
            @click="selectIcon(icon)"
            @mouseenter="selectedIndex = index"
          >
            <div class="absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100" :class="selectedIndex === index ? 'opacity-100' : ''" />
            <font-awesome-icon
              :icon="[icon.prefix, icon.icon]"
              class="text-lg text-white/90 transition-colors duration-150 relative z-10 group-hover:text-white"
              :class="selectedIndex === index ? 'text-white' : ''"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between py-2.5 px-4 border-t border-white/10 bg-black/15">
        <span class="text-xs text-white/50">{{ filteredIcons.length }} icons</span>
        <span class="text-xs text-white/50 font-mono">Press ESC to close</span>
      </div>
    </div>
  </Teleport>
</template>
