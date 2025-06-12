<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEventListener, useFocus, useScrollLock } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  maxWidth: {
    type: String,
    default: 'md',
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const modalRef = ref<HTMLElement | null>(null)
const isOpen = ref(props.modelValue)

const { focused } = useFocus(modalRef)
const scrollLock = useScrollLock(document.body)

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal
    if (newVal) {
      nextTick(() => {
        if (focused) {
          focused.value = true
        }
        if (scrollLock) {
          scrollLock.value = true
        }
      })
    } else {
      if (focused) {
        focused.value = false
      }
      if (scrollLock) {
        scrollLock.value = false
      }
    }
  },
)

const handleOutsideClick = (event: MouseEvent) => {
  if (
    props.closeOnClickOutside &&
    modalRef.value &&
    !modalRef.value.contains(event.target as Node)
  ) {
    closeModal()
  }
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (props.closeOnEsc && e.key === 'Escape' && isOpen.value) {
    closeModal()
  }
})

onMounted(() => {
  if (isOpen.value) {
    if (focused) {
      focused.value = true
    }
    if (scrollLock) {
      scrollLock.value = true
    }
  }
})

onBeforeUnmount(() => {
  if (focused) {
    focused.value = false
  }
  if (scrollLock) {
    scrollLock.value = false
  }
})

const maxWidthClass =
  {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }[props.maxWidth] || 'max-w-md'
console.log(maxWidthClass)
</script>

<template>
  <Teleport to="#modal">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
        @click="handleOutsideClick"
      >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>

        <div
          ref="modalRef"
          :class="[
            'relative w-full mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl transform transition-all overflow-hidden',
            maxWidthClass,
          ]"
        >
          <div
            class="px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between"
          >
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <span class="sr-only">Close</span>
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="px-6 py-4">
            <slot></slot>
          </div>

          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-gray-200/30 dark:border-gray-700/30"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
