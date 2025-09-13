<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import type { Country, City } from '@/types'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  items: {
    type: Array<Country | City>,
    default: () => [],
  },
  placeholder: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  inputId: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'item-select', 'input'])

const showDropdown = ref(false)

watch(
  () => props.items,
  (newItems) => {
    showDropdown.value = newItems.length > 0
  },
  { deep: true },
)

const handleItemSelect = (item: { id: string; name: string }) => {
  emit('item-select', item.id, item.name)
  showDropdown.value = false
}

const handleInput = (value: string) => {
  emit('update:modelValue', value)
  emit('input', value)
}
</script>

<template>
  <div class="relative w-full">
    <AuthInput
      :id="inputId"
      :model-value="modelValue"
      @update:model-value="handleInput"
      :placeholder="placeholder"
      :icon="icon"
    />

    <div
      v-if="showDropdown && items.length > 0"
      class="absolute z-10 mt-1 w-full bg-black/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto"
    >
      <div v-if="loading" class="p-3 text-center text-white/80">
        <font-awesome-icon icon="circle-notch" class="animate-spin mr-2" />
        Loading...
      </div>
      <div v-else-if="items.length === 0" class="p-3 text-center text-white/80">
        No results found
      </div>
      <div
        v-else
        v-for="item in items"
        :key="item.id"
        class="p-2 hover:bg-black/70 cursor-pointer text-white transition"
        @click="handleItemSelect(item)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
