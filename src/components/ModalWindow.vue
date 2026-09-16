<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from 'vue'
import { useEventListener, useFocus, useMediaQuery, useScrollLock } from '@vueuse/core'

import { useDragToDismiss } from '@/composables'

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'

// Written out in full — Tailwind only sees literal class names.
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
  eyebrow: {
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
})

const desktopWidthClass = computed(() => DESKTOP_MAX_WIDTHS[props.maxWidth])

const titleId = useId()

const emit = defineEmits(['update:modelValue', 'close'])

const modalRef = ref<HTMLElement | null>(null)
const isOpen = ref(props.modelValue)

const { focused } = useFocus(modalRef)
const scrollLock = useScrollLock(document.body)

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Below md the card is a bottom sheet; above it there is nothing to drag.
const isDesktop = useMediaQuery('(min-width: 768px)')
const { style: dragStyle, handlers: dragHandlers } = useDragToDismiss({
  isOpen: () => isOpen.value,
  onDismiss: closeModal,
  enabled: () => !isDesktop.value,
})

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

const handleBackdropClick = () => {
  if (props.closeOnClickOutside) {
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
    <div
      class="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      :class="{ 'pointer-events-none': !isOpen }"
    >
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
          @click="handleBackdropClick"
        />
      </Transition>

      <!-- Sibling of the backdrop: a leaving subtree never runs its children's transitions. -->
      <Transition
        enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
        leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
        enter-from-class="translate-y-full md:translate-y-0 md:-translate-x-10 md:opacity-0"
        leave-to-class="translate-y-full md:translate-y-0 md:translate-x-10 md:opacity-0"
      >
        <div
          v-if="isOpen"
          ref="modalRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
          class="relative flex max-h-[92dvh] w-full flex-col overflow-clip rounded-t-2xl border border-b-0 border-white/10 bg-[#0b0b0f]/95 text-left text-white shadow-2xl shadow-black/80 backdrop-blur-2xl focus:outline-none md:max-h-[90dvh] md:rounded-2xl md:border-b"
          :class="desktopWidthClass"
          :style="dragStyle"
        >
          <header
            class="relative shrink-0 touch-none border-b border-white/8 px-5 pt-2.5 pb-4 select-none md:touch-auto md:px-6 md:pt-5 md:select-auto"
            v-on="dragHandlers"
          >
            <span class="mx-auto mb-2.5 block h-1 w-9 rounded-full bg-white/15 md:hidden" />

            <button
              type="button"
              class="absolute top-2 right-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white md:top-4 md:right-4 md:size-8"
              aria-label="Close"
              @click="closeModal"
            >
              <font-awesome-icon icon="xmark" />
            </button>

            <div class="pr-12 md:pr-10">
              <slot name="header">
                <p v-if="eyebrow" class="text-[11px] tracking-[0.1em] text-white/35 uppercase">
                  {{ eyebrow }}
                </p>
                <h2 :id="titleId" class="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
                  {{ title }}
                </h2>
              </slot>
            </div>
          </header>

          <div
            class="modal-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6"
            :class="{
              'pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:pb-5': !$slots.footer,
            }"
          >
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="shrink-0 border-t border-white/8 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-3"
          >
            <slot name="footer" />
          </footer>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-scroll {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
}

.modal-scroll::-webkit-scrollbar {
  width: 6px;
}

.modal-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}
</style>
