<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import DayPickerDropdown from '@/components/dashboard/DayPickerDropdown.vue'
import { DAY_MS, startOfDay } from '@/utils/dates'

const props = defineProps<{ min: number; max: number }>()

const start = defineModel<Date | null>('start', { required: true })
const end = defineModel<Date | null>('end', { required: true })

const formatShort = (value: Date) =>
  value.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })

const nearestMidnight = (value: number) => startOfDay(new Date(value + DAY_MS / 2)).getTime()

const handleStart = ref(props.min)
const handleEnd = ref(props.max)
const handleStartDate = computed(() => new Date(nearestMidnight(handleStart.value)))
const handleEndDate = computed(() => new Date(nearestMidnight(handleEnd.value)))
const isDragging = ref(false)

// Keeps the handles under whatever set the range last — a date button, or the data bounds.
watch(
  [start, end, () => props.min, () => props.max],
  () => {
    handleStart.value = start.value ? startOfDay(start.value).getTime() : props.min
    handleEnd.value = end.value ? startOfDay(end.value).getTime() : props.max
  },
  { immediate: true },
)

const percentOf = (value: number) => {
  const span = props.max - props.min
  if (span <= 0) return 0
  return Math.min(100, Math.max(0, ((value - props.min) / span) * 100))
}

const fillStyle = computed(() => ({
  left: `${percentOf(handleStart.value)}%`,
  right: `${100 - percentOf(handleEnd.value)}%`,
}))

const onStartInput = (event: Event) => {
  handleStart.value = Math.min(Number((event.target as HTMLInputElement).value), handleEnd.value)
  isDragging.value = true
}

const onEndInput = (event: Event) => {
  handleEnd.value = Math.max(Number((event.target as HTMLInputElement).value), handleStart.value)
  isDragging.value = true
}

// A handle parked on its end of the track means "unbounded", so dragging it back clears the filter.
const commit = () => {
  isDragging.value = false
  handleStart.value = handleStartDate.value.getTime()
  handleEnd.value = handleEndDate.value.getTime()
  start.value = handleStart.value > props.min ? new Date(handleStart.value) : null
  end.value = handleEnd.value < props.max ? new Date(handleEnd.value) : null
}

const edges = computed(() => [
  {
    label: 'Range start',
    align: 'start' as const,
    prompt: 'From which day?',
    date: handleStartDate.value,
    minDate: null,
    maxDate: handleEndDate.value,
    pick: (date: Date) => {
      start.value = date
    },
  },
  {
    label: 'Range end',
    align: 'end' as const,
    prompt: 'Up to which day?',
    date: handleEndDate.value,
    minDate: handleStartDate.value,
    maxDate: null,
    pick: (date: Date) => {
      end.value = date
    },
  },
])
</script>

<template>
  <div class="glass-panel p-3">
    <p class="text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase">Date</p>

    <!-- Taller than the thumb so the track stays draggable on a phone. -->
    <div class="relative mt-1 h-9">
      <span
        class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.2))]"
        aria-hidden="true"
      />
      <!-- Dark at the old end, light at the recent one, so the covered span reads as a direction. -->
      <span
        class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(112,100,190,0.9)_0%,rgba(184,205,235,0.9)_100%)] motion-reduce:transition-none"
        :class="isDragging ? 'transition-none' : 'transition-[left,right] duration-140 ease-[ease]'"
        :style="fillStyle"
        aria-hidden="true"
      />
      <input
        class="range-input"
        type="range"
        :min="min"
        :max="max"
        :step="isDragging ? 'any' : DAY_MS"
        :value="handleStart"
        :aria-valuetext="formatShort(handleStartDate)"
        aria-label="Range start"
        @pointerdown="isDragging = true"
        @input="onStartInput"
        @change="commit"
      />
      <input
        class="range-input range-input-end"
        type="range"
        :min="min"
        :max="max"
        :step="isDragging ? 'any' : DAY_MS"
        :value="handleEnd"
        :aria-valuetext="formatShort(handleEndDate)"
        aria-label="Range end"
        @pointerdown="isDragging = true"
        @input="onEndInput"
        @change="commit"
      />
    </div>

    <div class="flex justify-between">
      <DayPickerDropdown
        v-for="edge in edges"
        :key="edge.label"
        :align="edge.align"
        :prompt="edge.prompt"
        :selected="edge.date"
        :min-date="edge.minDate"
        :max-date="edge.maxDate"
        @pick="edge.pick"
      >
        <button
          type="button"
          class="inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border border-white/14 bg-white/4 px-[9px] py-1 text-xs text-white/75 tabular-nums transition-all duration-150 hover:border-white/35 hover:bg-white/10 hover:text-white"
          :class="{ 'flex-row-reverse': edge.align === 'end' }"
          :aria-label="`${edge.label}, ${formatShort(edge.date)}`"
        >
          <font-awesome-icon icon="calendar-days" class="text-[10px] text-white/50" />
          {{ formatShort(edge.date) }}
        </button>
      </DayPickerDropdown>
    </div>
  </div>
</template>

<style scoped>
/* Both inputs span the track, so only their thumbs take the pointer or one would trap the other. */
.range-input {
  position: absolute;
  left: 0;
  width: 100%;
  height: 36px;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  --thumb-color: rgb(150, 136, 240);
}

/* Each handle wears the color of its end of the fill. */
.range-input.range-input-end {
  --thumb-color: rgb(196, 214, 240);
}

.range-input:focus {
  outline: none;
}

.range-input::-webkit-slider-runnable-track {
  height: 36px;
  background: transparent;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  /* A styled WebKit thumb hugs the top of its 36px track; this drops it onto the line. */
  margin-top: 8px;
  border-radius: 50%;
  border: 2px solid var(--thumb-color);
  background: radial-gradient(circle, var(--thumb-color) 0 3px, rgb(22, 20, 38) 3.5px);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--thumb-color) 18%, transparent),
    0 2px 8px rgba(0, 0, 0, 0.55);
  cursor: grab;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.08);
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--thumb-color) 26%, transparent),
    0 2px 8px rgba(0, 0, 0, 0.55);
}

.range-input::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.12);
  box-shadow:
    0 0 0 8px color-mix(in srgb, var(--thumb-color) 30%, transparent),
    0 2px 8px rgba(0, 0, 0, 0.55);
}

.range-input:focus-visible::-webkit-slider-thumb {
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.55);
}

.range-input::-moz-range-track {
  height: 36px;
  background: transparent;
}

.range-input::-moz-range-thumb {
  pointer-events: auto;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--thumb-color);
  background: radial-gradient(circle, var(--thumb-color) 0 3px, rgb(22, 20, 38) 3.5px);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--thumb-color) 18%, transparent),
    0 2px 8px rgba(0, 0, 0, 0.55);
  cursor: grab;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.range-input::-moz-range-thumb:hover {
  transform: scale(1.08);
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--thumb-color) 26%, transparent),
    0 2px 8px rgba(0, 0, 0, 0.55);
}

.range-input::-moz-range-thumb:active {
  cursor: grabbing;
  transform: scale(1.12);
  box-shadow:
    0 0 0 8px color-mix(in srgb, var(--thumb-color) 30%, transparent),
    0 2px 8px rgba(0, 0, 0, 0.55);
}

.range-input:focus-visible::-moz-range-thumb {
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.55);
}
</style>
