<script setup lang="ts">
import TagSelector from '@/components/day/TagSelector.vue'
import LocationFlow from '@/components/ui/LocationFlow.vue'
import type { CityDetail, Country, Tag } from '@/types'

defineProps<{ availableTags: Tag[] }>()

const similarity = defineModel<boolean>('similarity', { required: true })
const starred = defineModel<boolean>('starred', { required: true })
const tags = defineModel<Tag[]>('tags', { required: true })
const country = defineModel<Country | null>('country', { required: true })
const city = defineModel<CityDetail | null>('city', { required: true })

const toggles = [
  { label: 'Similarity search', model: similarity },
  { label: 'Starred', model: starred },
]

const pickCountry = (value: Country | null) => {
  country.value = value
  city.value = null
}

const pickCity = (value: CityDetail | null) => {
  city.value = value
  if (value?.country) country.value = value.country
}
</script>

<template>
  <div class="overflow-hidden">
    <div class="glass-panel mt-3 space-y-3 p-3">
      <div class="flex flex-wrap items-center gap-2">
        <!-- The row keeps a 36px tap target while the box itself stays a control, not a tile. -->
        <button
          v-for="toggle in toggles"
          :key="toggle.label"
          type="button"
          class="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-1.5 text-sm transition-all duration-150"
          :class="
            toggle.model.value
              ? 'border-white/55 bg-white/14 text-white'
              : 'border-white/20 text-white/85 hover:border-white/40 hover:bg-white/10'
          "
          :aria-pressed="toggle.model.value"
          @click="toggle.model.value = !toggle.model.value"
        >
          <span
            class="inline-flex size-4 shrink-0 items-center justify-center rounded border text-[#0b1120]"
            :class="toggle.model.value ? 'border-white bg-white' : 'border-white/55'"
            aria-hidden="true"
          >
            <font-awesome-icon v-if="toggle.model.value" icon="check" class="text-[10px]" />
          </span>
          {{ toggle.label }}
        </button>
      </div>

      <div class="relative z-20">
        <p class="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase">
          Location
        </p>
        <LocationFlow
          :country="country"
          :city="city"
          country-input-id="dashboard-country-input"
          city-input-id="dashboard-city-input"
          @update:country="pickCountry"
          @update:city="pickCity"
        />
      </div>

      <div class="relative z-10">
        <p class="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase">Tags</p>
        <TagSelector v-model="tags" :available-tags="availableTags" />
      </div>
    </div>
  </div>
</template>
