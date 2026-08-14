<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEventListener, useFocus, useScrollLock } from '@vueuse/core'

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'

const MAX_WIDTHS: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

// Written out rather than built from MAX_WIDTHS — Tailwind only sees literal class names.
const DESKTOP_MAX_WIDTHS: Record<MaxWidth, string> = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
  xl: 'md:max-w-xl',
  '2xl': 'md:max-w-2xl',
  '3xl': 'md:max-w-3xl',
  '4xl': 'md:max-w-4xl',
  '5xl': 'md:max-w-5xl',
  '6xl': 'md:max-w-6xl',
  '7xl': 'md:max-w-7xl',
  full: 'md:max-w-full',
}

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
    type: String as PropType<MaxWidth>,
    default: 'md',
    validator: (value: string) =>
      ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'].includes(value),
  },
  fullScreenOnMobile: {
    type: Boolean,
    default: true,
  },
})

const goesFullScreen = computed(() => props.fullScreenOnMobile && props.maxWidth !== 'full')

const wrapperClass = computed(() =>
  goesFullScreen.value
    ? 'h-full md:block md:h-auto md:min-h-dvh'
    : 'flex items-center justify-center min-h-dvh pt-4 px-4 pb-20 text-center md:block md:p-0',
)

const cardClass = computed(() => {
  if (props.maxWidth === 'full') {
    return 'w-full max-w-full h-full max-h-full m-0 rounded-none'
  }
  if (goesFullScreen.value) {
    return [
      'w-full h-full rounded-none',
      'md:mx-auto md:h-auto md:max-h-[90dvh] md:my-8 md:rounded-2xl',
      DESKTOP_MAX_WIDTHS[props.maxWidth],
    ]
  }
  return ['mx-auto w-full my-8 max-h-[90dvh] rounded-2xl', MAX_WIDTHS[props.maxWidth]]
})

const headerClass = computed(() => {
  if (props.maxWidth === 'full') return ''
  return goesFullScreen.value ? 'md:rounded-t-2xl' : 'rounded-t-2xl'
})

const footerClass = computed(() => {
  if (props.maxWidth === 'full') return 'py-4'
  return goesFullScreen.value
    ? 'pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4 md:rounded-b-2xl'
    : 'py-4 rounded-b-2xl'
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
    <Transition
      name="modal-backdrop"
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div :class="wrapperClass">
          <Transition
            enter-active-class="ease-out duration-500"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="ease-in duration-400"
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
            enter-from-class="opacity-0 translate-y-4 md:scale-95"
            enter-to-class="opacity-100 translate-y-0 md:scale-100"
            leave-active-class="ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 md:scale-100"
            leave-to-class="opacity-0 translate-y-4 md:scale-95"
          >
            <div
              v-if="isOpen"
              ref="modalRef"
              class="relative bg-gray-800 text-left shadow-xl transform transition-all flex flex-col"
              :class="cardClass"
              tabindex="-1"
            >
              <!-- Header -->
              <div
                class="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0"
                :class="headerClass"
              >
                <slot name="header">
                  <h3 class="text-lg font-medium text-white">{{ title }}</h3>
                </slot>
              </div>

              <!-- Content -->
              <div class="px-6 py-4 flex-1 overflow-y-auto">
                <slot />
              </div>

              <!-- Footer -->
              <div
                v-if="$slots.footer"
                class="px-6 border-t border-white/10 bg-gray-900/50 flex-shrink-0"
                :class="footerClass"
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
