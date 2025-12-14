<script setup lang="ts">
import { computed } from 'vue'
import type { Country, CityDetail } from '@/types'
import { useLocation } from '@/composables'
import citiesApi from '@/api/cities'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete.vue'

const props = withDefaults(
  defineProps<{
    country: Country | null
    city: CityDetail | null
    countryInputId?: string
    cityInputId?: string
    countryPlaceholder?: string
    cityPlaceholder?: string
    disabled?: boolean
    fullWidth?: boolean
    variant?: 'default' | 'auth' | 'settings'
  }>(),
  {
    country: null,
    city: null,
    countryInputId: 'location-country-input',
    cityInputId: 'location-city-input',
    countryPlaceholder: 'Search country...',
    cityPlaceholder: 'Search city...',
    disabled: false,
    fullWidth: true,
    variant: 'default',
  },
)

const emit = defineEmits<{
  (e: 'update:country', value: Country | null): void
  (e: 'update:city', value: CityDetail | null): void
}>()

const { fetchCountries, fetchCities } = useLocation()

const countryLabel = computed(() => props.country?.name || '')
const cityLabel = computed(() => props.city?.name || '')

const isCityDisabled = computed(() => props.disabled || !props.country)

const handleCountrySelect = (item: Country | CityDetail) => {
  if ('code' in item) {
    emit('update:country', item)
    emit('update:city', null)
  }
}

const handleCitySelect = (item: Country | CityDetail) => {
  if ('country' in item) {
    emit('update:country', item.country)
    emit('update:city', item)
    return
  }

  if ('id' in item) {
    void (async () => {
      const res = await citiesApi.getCityById(item.id)
      if (res.code === 200 && res.data && 'country' in res.data) {
        const cityDetail = res.data as unknown as CityDetail
        emit('update:country', cityDetail.country)
        emit('update:city', cityDetail)
      }
    })()
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="relative">
      <p class="text-sm mb-2 text-white/80">Country</p>
      <LocationAutocomplete
        :model-value="countryLabel"
        :placeholder="countryPlaceholder"
        icon="globe"
        :input-id="countryInputId"
        :show-country-code="true"
        :full-width="fullWidth"
        :disabled="disabled"
        :variant="props.variant"
        :fetch-items="(query: string) => fetchCountries(query)"
        class="relative z-10"
        @select="handleCountrySelect"
      />
    </div>

    <div class="relative">
      <p class="text-sm mb-2 text-white/80">City</p>
      <LocationAutocomplete
        :model-value="cityLabel"
        :placeholder="props.country ? cityPlaceholder : 'Select country first'"
        icon="map-marker-alt"
        :input-id="cityInputId"
        :disabled="isCityDisabled"
        :country-id="props.country?.id || ''"
        :full-width="fullWidth"
        :variant="props.variant"
        :fetch-items="(query: string) => fetchCities(query, props.country?.id || '')"
        class="relative z-10"
        @select="handleCitySelect"
      />
    </div>
  </div>
</template>
