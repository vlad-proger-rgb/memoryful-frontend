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
      :max-width="'full'"
      class="bg-black/90"
      @close="closeModal"
    >
      <template #default>
        <div class="relative w-full flex items-center justify-center">
          <div class="relative">
            <img
              :src="getImageUrl(images[selectedIndex])"
              :alt="alt"
              class="max-h-[80vh] max-w-[80vw] w-auto h-auto object-contain"
            />

            <button
              v-if="images.length > 1"
              @click.stop="previousImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              <font-awesome-icon icon="chevron-left" class="h-4 w-4" />
            </button>

            <button
              v-if="images.length > 1"
              @click.stop="nextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              <font-awesome-icon icon="chevron-right" class="h-4 w-4" />
            </button>

            <div v-if="images.length > 1" class="text-center mt-4 text-white/80 text-sm">
              {{ selectedIndex + 1 }} / {{ images.length }}
            </div>
          </div>
        </div>
      </template>
    </ModalWindow>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

const getImageUrl = (imagePath: string) => {
  return props.basePath ? `${props.basePath}${imagePath}` : imagePath
}

const openModal = (index: number) => {
  selectedIndex.value = index
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const nextImage = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.images.length
}

const previousImage = () => {
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
  transition: all 0.3s ease;
}
</style>
