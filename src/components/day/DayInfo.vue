<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  date: string | number
  description: string | undefined
  starred?: boolean
  exists?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleStarred', date: string | number): void
}>()

const showTooltip = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

const isStarAnimating = ref(false)
const isStarShaking = ref(false)
const showStarTooltip = ref(false)
const starTooltipText = ref('')

const toggleStarred = () => {
  isStarAnimating.value = true
  emit('toggleStarred', props.date)
  starTooltipText.value = props.starred ? 'Day unstarred!' : 'Day starred!'
  showStarTooltip.value = true
  setTimeout(() => {
    showStarTooltip.value = false
  }, 1500)
}

const onStarAnimationEnd = () => {
  isStarAnimating.value = false
}

const showTooltipForGrayStar = () => {
  if (showTooltip.value) return
  showTooltip.value = true
  isStarShaking.value = true
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  tooltipTimeout = setTimeout(() => {
    showTooltip.value = false
  }, 1500)
}

const onGrayStarAnimationEnd = () => {
  isStarShaking.value = false
}
</script>

<template>
  <div class="flex items-start justify-between w-full">
    <div>
      <div class="text-2xl font-semibold">
        {{
          new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </div>
      <div v-if="description" class="text-base mt-1 whitespace-pre-line">{{ description }}</div>
      <div v-else class="text-base mt-1 whitespace-pre-line">No description</div>
    </div>
    <button
      class="ml-4 text-white text-2xl hover:cursor-pointer"
      @click="exists ? toggleStarred() : showTooltipForGrayStar()"
    >
      <span class="relative">
        <font-awesome-icon
          v-if="exists"
          icon="star"
          :class="[starred ? 'text-yellow-400' : '', isStarAnimating ? 'star-animate' : '']"
          class="hover:text-yellow-300 transition-colors duration-300"
          @animationend="onStarAnimationEnd"
        />
        <template v-else>
          <font-awesome-icon
            icon="star"
            class="text-gray-400"
            title="Not created yet"
            :class="[isStarShaking ? 'star-shake' : '']"
            @animationend="onGrayStarAnimationEnd"
          />
          <transition name="fade">
            <div
              v-if="showTooltip"
              class="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow z-10 whitespace-nowrap"
            >
              You can only star days that are created.
            </div>
          </transition>
        </template>
        <transition name="fade">
          <div
            v-if="showStarTooltip && exists"
            class="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow z-10 whitespace-nowrap"
            style="top: 2.5rem"
          >
            {{ starTooltipText }}
          </div>
        </transition>
      </span>
    </button>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
.star-animate {
  animation: star-bounce 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes star-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
.star-shake {
  animation: star-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes star-shake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-3px);
  }
  40%,
  60% {
    transform: translateX(3px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
