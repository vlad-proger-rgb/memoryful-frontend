<template>
  <div class="image-gallery">
    <div v-if="images?.length" class="grid grid-cols-2 gap-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="cursor-pointer hover:opacity-90 transition-opacity"
        @click="openModal(index)"
      >
        <img :src="getImageUrl(image)" :alt="alt" class="w-full h-48 object-cover rounded-2xl" />
      </div>
    </div>
    <div v-else class="text-center py-4 text-white/50 text-sm">No images to display</div>

    <!-- Modal -->
    <ModalWindow
      v-model="isOpen"
      :close-on-click-outside="true"
      :close-on-esc="true"
      :max-width="'7xl'"
      class="bg-black/90"
      @close="closeModal"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-medium text-white">Image Gallery</h3>
          <button
            @click="closeModal"
            class="text-white/70 hover:text-white transition-colors"
            aria-label="Close gallery"
          >
            <font-awesome-icon icon="times" class="h-5 w-5" />
          </button>
        </div>
      </template>

      <template #default>
        <div class="relative w-full h-full flex items-center justify-center p-4">
          <div class="relative max-w-full max-h-full">
            <Transition name="fade" mode="out-in">
              <div v-if="!isTransitioning" class="relative" :key="currentImage">
                <img
                  :src="currentImage"
                  :alt="alt"
                  class="max-h-[70vh] max-w-[90vw] w-auto h-auto object-contain"
                  @click.stop
                />
              </div>
              <div
                v-else
                class="max-h-[70vh] max-w-[90vw] w-auto h-auto flex items-center justify-center"
              >
                <div class="animate-pulse text-white/50">Loading...</div>
              </div>
            </Transition>

            <button
              v-if="images.length > 1"
              @click.stop="previousImage"
              class="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <font-awesome-icon icon="chevron-left" class="h-5 w-5" />
            </button>

            <button
              v-if="images.length > 1"
              @click.stop="nextImage"
              class="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <font-awesome-icon icon="chevron-right" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between w-full text-sm">
          <div class="text-white/70">{{ selectedIndex + 1 }} of {{ images.length }}</div>
          <div class="flex items-center space-x-2">
            <button
              v-if="images.length > 1"
              @click="previousImage"
              class="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
              :disabled="selectedIndex === 0"
              :class="{ 'opacity-50 cursor-not-allowed': selectedIndex === 0 }"
            >
              Previous
            </button>
            <button
              v-if="images.length > 1"
              @click="nextImage"
              class="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
              :disabled="selectedIndex === images.length - 1"
              :class="{ 'opacity-50 cursor-not-allowed': selectedIndex === images.length - 1 }"
            >
              Next
            </button>
          </div>
        </div>
      </template>
    </ModalWindow>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import ModalWindow from '@/components/ModalWindow.vue'

const props = withDefaults(
  defineProps<{
    images: string[]
    alt?: string
    basePath?: string
  }>(),
  {
    images: () => [],
    alt: '',
    basePath: '',
  },
)

const isOpen = ref(false)
const selectedIndex = ref(0)
const isTransitioning = ref(false)
const currentImage = ref('')

// Watch for image changes to trigger transition
watch(
  () => selectedIndex.value,
  async (newIndex, oldIndex) => {
    if (newIndex !== oldIndex) {
      isTransitioning.value = true
      await nextTick()
      // Small delay to allow the fade-out to be visible
      await new Promise((resolve) => setTimeout(resolve, 150))
      currentImage.value = getImageUrl(props.images[newIndex])
      isTransitioning.value = false
    }
  },
  { immediate: true },
)

const getImageUrl = (imagePath: string) => {
  return props.basePath ? `${props.basePath}${imagePath}` : imagePath
}

const openModal = (index: number) => {
  selectedIndex.value = index
  currentImage.value = getImageUrl(props.images[index])
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const nextImage = () => {
  if (isTransitioning.value) return
  selectedIndex.value = (selectedIndex.value + 1) % props.images.length
}

const previousImage = () => {
  if (isTransitioning.value) return
  selectedIndex.value = (selectedIndex.value - 1 + props.images.length) % props.images.length
}

// Handle keyboard navigation
const onKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return

  switch (e.key) {
    case 'Escape':
      closeModal()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// Add keyboard event listeners
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Button hover effects */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
