import { ref } from 'vue'
import type { Country, City, CityDetail } from '@/types'
import countriesApi from '@/api/countries'
import citiesApi from '@/api/cities'

export function useLocation() {
  const selectedCountry = ref<Country | null>(null)
  const selectedCity = ref<CityDetail | null>(null)

  const fetchCountries = async (query: string): Promise<Country[]> => {
    try {
      const response = await countriesApi.getCountries(query)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch countries:', error)
      return []
    }
  }

  const fetchCities = async (query: string, countryId: string): Promise<City[]> => {
    if (!countryId) return []

    try {
      const response = await citiesApi.getCities(countryId, query)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch cities:', error)
      return []
    }
  }

  const setSelectedCountry = (country: Country | null) => {
    selectedCountry.value = country
    if (!country) {
      selectedCity.value = null
    }
  }

  const setSelectedCity = (city: CityDetail | null) => {
    selectedCity.value = city
    if (city && city.country) {
      selectedCountry.value = city.country
    }
  }

  const resetLocation = () => {
    selectedCountry.value = null
    selectedCity.value = null
  }

  return {
    selectedCountry,
    selectedCity,
    fetchCountries,
    fetchCities,
    setSelectedCountry,
    setSelectedCity,
    resetLocation,
  }
}
