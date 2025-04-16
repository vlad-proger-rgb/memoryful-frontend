<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthUtils } from '@/composables/useAuthUtils.ts'
import { countriesApi } from '@/api/countries.ts'
import { citiesApi } from '@/api/cities.ts'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import LocationAutocomplete from '@/components/auth/LocationAutocomplete.vue'
import type { Country } from '@/types'
import type { City } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const userStore = useUserStore()
const router = useRouter()

const { shakeElement } = useAuthUtils()

const countries = ref<Country[]>([])
const cities = ref<City[]>([])
const country_name = ref('')
const city_name = ref('')
const loadingCountries = ref(false)
const loadingCities = ref(false)

const nameInputId = ref('profile-name-input')
const countryInputId = ref('profile-country-input')
const cityInputId = ref('profile-city-input')
const jobTitleInputId = ref('profile-job-title-input')

onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
  }

  if (userStore.isProfileComplete) {
    router.push('/dashboard')
  }
})

const handleCountryInput = async (value: string) => {
  country_name.value = value
  if (value.length > 0) {
    await fetchCountries()
  } else {
    countries.value = []
  }
}

const handleCityInput = async (value: string) => {
  city_name.value = value
  if (value.length > 0 && userStore.user.country_id) {
    await fetchCities()
  } else {
    cities.value = []
  }
}

const fetchCountries = async () => {
  loadingCountries.value = true
  try {
    const result = (await countriesApi.getCountries(country_name.value)).data
    if (result) countries.value = result
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    countries.value = []
  } finally {
    loadingCountries.value = false
  }
}

const fetchCities = async () => {
  if (userStore.user.country_id) {
    loadingCities.value = true
    try {
      const result = (await citiesApi.getCities(userStore.user.country_id, city_name.value)).data
      if (result) cities.value = result
    } catch (error) {
      console.error('Failed to fetch cities:', error)
      cities.value = []
    } finally {
      loadingCities.value = false
    }
  }
}

const handleCountrySelect = (countryId: string, countryName: string) => {
  userStore.user.country_id = countryId
  country_name.value = countryName
  countries.value = []
  userStore.user.city_id = ''
  city_name.value = ''
  userStore.errorMessage = ''
}

const handleCitySelect = (cityId: string, cityName: string) => {
  userStore.user.city_id = cityId
  city_name.value = cityName
  cities.value = []
  userStore.errorMessage = ''
}

const handleUpdateProfile = async () => {
  if (!userStore.user.first_name) {
    userStore.errorMessage = 'Please enter your name'
    shakeElement(nameInputId.value)
    return
  }

  if (!userStore.user.country_id) {
    userStore.errorMessage = 'Please enter your country'
    shakeElement(countryInputId.value)
    return
  }

  if (!userStore.user.city_id) {
    userStore.errorMessage = 'Please enter your city'
    shakeElement(cityInputId.value)
    return
  }

  if (!userStore.user.job_title) {
    userStore.errorMessage = 'Please enter your job title'
    shakeElement(jobTitleInputId.value)
    return
  }

  const success = await userStore.updateUserProfile()
  if (success) {
    await router.push('/dashboard')
  }
}

const handleLogout = async () => {
  await userStore.logout()
  userStore.errorMessage = ''
  await router.push('/login')
}
</script>

<template>
  <AuthCard
    title="Profile Details"
    subtitle="Complete your profile to continue"
  >
    <div class="w-full flex justify-center flex-col gap-4">
      <AuthInput
        v-model="userStore.user.first_name"
        type="text"
        placeholder="Name"
        icon="user"
        :id="nameInputId"
        @update:model-value="userStore.errorMessage = ''"
      />

      <div class="flex flex-col md:flex-row md:justify-between gap-2">
        <div class="w-full md:w-1/2">
          <LocationAutocomplete
            v-model="country_name"
            :items="countries"
            placeholder="Country"
            icon="flag"
            :input-id="countryInputId"
            :loading="loadingCountries"
            @input="handleCountryInput"
            @item-select="handleCountrySelect"
          />
        </div>

        <div class="w-full md:w-1/2">
          <LocationAutocomplete
            v-model="city_name"
            :items="cities"
            placeholder="City"
            icon="city"
            :input-id="cityInputId"
            :loading="loadingCities"
            @input="handleCityInput"
            @item-select="handleCitySelect"
          />
        </div>
      </div>

      <AuthInput
        v-model="userStore.user.job_title"
        type="text"
        placeholder="Job Title"
        icon="address-card"
        :id="jobTitleInputId"
        @update:model-value="userStore.errorMessage = ''"
      />

      <p v-if="userStore.errorMessage" class="text-red-400 text-sm ml-2">
        {{ userStore.errorMessage }}
      </p>
    </div>

    <AuthButton
      :loading="userStore.isLoading"
      :has-error="!!userStore.errorMessage"
      :disabled="userStore.isLoading"
      @click="handleUpdateProfile"
    >
      <template #default>Save</template>
      <template #icon-right v-if="!userStore.isLoading">
        <font-awesome-icon icon="angle-double-right" />
      </template>
      <template #icon-right v-else>
        <font-awesome-icon icon="circle-notch" class="animate-spin" />
      </template>
    </AuthButton>

    <div class="flex w-full">
      <AuthButton
        variant="link"
        @click="handleLogout"
      >
        Cancel & Log Out
      </AuthButton>
    </div>
  </AuthCard>
</template>
