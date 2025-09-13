<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthUtils, useLocation } from '@/composables'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete.vue'
import type { CityDetail, Country } from '@/types'

const userStore = useUserStore()
const router = useRouter()

const {
  selectedCountry,
  selectedCity,
  fetchCountries,
  fetchCities,
  setSelectedCountry,
  setSelectedCity,
} = useLocation()

const { shakeElement } = useAuthUtils()

const nameInputId = ref('profile-name-input')
const countryInputId = ref('profile-country-input')
const cityInputId = ref('profile-city-input')
const jobTitleInputId = ref('profile-job-title-input')

// Initialize form with user data if available
onMounted(() => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
  }

  if (userStore.isProfileComplete) {
    router.push('/dashboard')
  }

  // Initialize with user's current location if available
  if (userStore.user.city) {
    setSelectedCity(userStore.user.city)
    if (userStore.user.city.country) {
      setSelectedCountry(userStore.user.city.country)
    }
  }
})

const handleCountrySelect = (item: Country | CityDetail) => {
  if ('code' in item) {
    setSelectedCountry(item)
    setSelectedCity(null)
    userStore.errorMessage = ''
  }
}

const handleCitySelect = (item: Country | CityDetail) => {
  if ('country' in item) {
    setSelectedCity(item)
    userStore.errorMessage = ''
  }
}

const handleUpdateProfile = async () => {
  try {
    userStore.isLoading = true
    userStore.errorMessage = ''

    // Update user data
    userStore.user = {
      ...userStore.user,
      firstName: userStore.user.firstName,
      lastName: userStore.user.lastName,
      jobTitle: userStore.user.jobTitle,
    }

    await userStore.updateUserProfile()
    router.push('/dashboard')
  } catch (error) {
    userStore.errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
    const formElement = document.getElementById('profile-form')
    if (formElement) {
      shakeElement('profile-form')
    }
  } finally {
    userStore.isLoading = false
  }
}

const handleLogout = async () => {
  await userStore.logout()
  userStore.errorMessage = ''
  await router.push('/login')
}
</script>

<template>
  <AuthCard title="Profile Details" subtitle="Complete your profile to continue">
    <div class="w-full flex justify-center flex-col gap-4">
      <AuthInput
        v-model="userStore.user.firstName"
        type="text"
        placeholder="First Name"
        icon="user"
        :id="nameInputId"
        @update:model-value="userStore.errorMessage = ''"
      />

      <div class="flex flex-col md:flex-row md:justify-between gap-4">
        <div class="w-full md:w-1/2 relative">
          <LocationAutocomplete
            :model-value="selectedCountry?.name || ''"
            :placeholder="'Search country...'"
            icon="globe"
            :input-id="countryInputId"
            :show-country-code="true"
            :full-width="true"
            :fetch-items="(query: string) => fetchCountries(query)"
            class="relative z-10"
            @select="handleCountrySelect"
            @update:model-value="
              (val: string) => {
                /* handle input if needed */
              }
            "
          />
        </div>

        <div class="w-full md:w-1/2 relative">
          <LocationAutocomplete
            :model-value="selectedCity?.name || ''"
            :placeholder="selectedCountry ? 'Search city...' : 'Select country first'"
            icon="map-marker-alt"
            :input-id="cityInputId"
            :disabled="!selectedCountry"
            :country-id="selectedCountry?.id || ''"
            :full-width="true"
            :fetch-items="(query: string) => fetchCities(query, selectedCountry?.id || '')"
            class="relative z-10"
            @select="handleCitySelect"
            @update:model-value="
              (val: string) => {
                /* handle input if needed */
              }
            "
          />
        </div>
      </div>

      <AuthInput
        v-model="userStore.user.jobTitle"
        type="text"
        placeholder="Job Title"
        icon="briefcase"
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
      <AuthButton variant="link" @click="handleLogout"> Cancel & Log Out </AuthButton>
    </div>
  </AuthCard>
</template>
