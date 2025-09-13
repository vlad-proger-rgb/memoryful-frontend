<script setup lang="ts">
import type { PropType } from 'vue'
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
    type: String as PropType<
      'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
    >,
    default: 'md',
    validator: (value: string) =>
      ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'].includes(value),
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
</script>

<template>
  <Teleport to="#modal">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <Transition
            enter-active-class="ease-out duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="ease-in duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="isOpen"
              class="fixed inset-0 bg-black/50 transition-opacity"
              aria-hidden="true"
              @click="handleOutsideClick"
            />
          </Transition>

          <Transition
            enter-active-class="ease-out duration-300"
            enter-from-class="opacity-0 translate-y-4 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:scale-95"
          >
            <div
              v-if="isOpen"
              ref="modalRef"
              class="relative bg-gray-800 text-left shadow-xl transform transition-all flex flex-col sm:my-8 max-h-[90vh]"
              :class="{
                'mx-auto w-full max-w-sm': maxWidth === 'sm',
                'mx-auto w-full max-w-md': maxWidth === 'md',
                'mx-auto w-full max-w-lg': maxWidth === 'lg',
                'mx-auto w-full max-w-xl': maxWidth === 'xl',
                'mx-auto w-full max-w-2xl': maxWidth === '2xl' || !maxWidth,
                'mx-auto w-full max-w-3xl': maxWidth === '3xl',
                'mx-auto w-full max-w-4xl': maxWidth === '4xl',
                'mx-auto w-full max-w-5xl': maxWidth === '5xl',
                'mx-auto w-full max-w-6xl': maxWidth === '6xl',
                'mx-auto w-full max-w-7xl': maxWidth === '7xl',
                'w-full max-w-full h-full max-h-full m-0 rounded-none': maxWidth === 'full',
              }"
              tabindex="-1"
            >
              <!-- Header -->
              <div
                v-if="$slots.header"
                class="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0"
              >
                <slot name="header" />
              </div>
              <div v-else class="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
                <h3 class="text-lg font-medium text-white">{{ title }}</h3>
              </div>

              <!-- Content -->
              <div class="px-6 py-4 flex-1 overflow-y-auto">
                <slot />
              </div>

              <!-- Footer -->
              <div
                v-if="$slots.footer"
                class="px-6 py-4 border-t border-white/10 bg-gray-900/50 flex-shrink-0"
              >
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
