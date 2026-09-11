<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

import type { WeekOption } from '@/composables'

const props = defineProps<{
  modelValue: string
  options: WeekOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const current = computed(
  () => props.options.find((o) => o.weekStart === props.modelValue)?.label ?? 'Pick a week',
)

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (isOpen.value = false))

const choose = (weekStart: string) => {
  emit('update:modelValue', weekStart)
  isOpen.value = false
}
</script>

<template>
  <!-- Native below md: the OS picker beats anything hand-rolled on a phone. -->
  <div class="relative md:hidden">
    <select
      :value="modelValue"
      class="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pr-8 pl-3 text-sm text-white/85 outline-none"
      aria-label="Choose a week"
      @change="choose(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in options"
        :key="option.weekStart"
        :value="option.weekStart"
        class="bg-[#12121a] text-white"
      >
        {{ option.label }}
      </option>
    </select>
    <font-awesome-icon
      icon="chevron-down"
      class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-white/40"
    />
  </div>

  <div ref="root" class="relative hidden md:block">
    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:border-white/20 hover:bg-white/10"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="isOpen = !isOpen"
    >
      <span class="truncate">{{ current }}</span>
      <font-awesome-icon
        icon="chevron-down"
        class="shrink-0 text-[11px] text-white/40 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-in"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul
        v-if="isOpen"
        class="digest-scroll absolute z-10 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-white/12 bg-[#15151d] p-1 shadow-2xl shadow-black/60"
        role="listbox"
      >
        <li v-for="option in options" :key="option.weekStart">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition"
            :class="
              option.weekStart === modelValue
                ? 'bg-white/12 text-white'
                : 'text-white/65 hover:bg-white/8 hover:text-white'
            "
            role="option"
            :aria-selected="option.weekStart === modelValue"
            @click="choose(option.weekStart)"
          >
            <span>{{ option.label }}</span>
            <font-awesome-icon
              v-if="option.weekStart === modelValue"
              icon="check"
              class="text-[10px] text-white/50"
            />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
