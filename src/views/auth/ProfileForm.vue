<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { useAuthUtils, useLocation } from '@/composables'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import LocationFlow from '@/components/ui/LocationFlow.vue'

const userStore = useUserStore()
const uiStore = useUiStore()
const router = useRouter()

const {
  selectedCountry,
  selectedCity,
  setSelectedCountry,
  setSelectedCity,
} = useLocation()

const { shakeElement } = useAuthUtils()

const nameInputId = ref('profile-name-input')
const countryInputId = 'profile-country-input'
const cityInputId = 'profile-city-input'
const ageInputId = ref('profile-age-input')

const ageDraft = ref<number | undefined>(undefined)
const bioDraft = ref('')

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

  ageDraft.value = typeof userStore.user.age === 'number' ? userStore.user.age : undefined
  bioDraft.value = userStore.user.bio || ''
})

const handleUpdateProfile = async () => {
  try {
    userStore.isLoading = true
    userStore.errorMessage = ''

    if (selectedCity.value) {
      userStore.setUser({
        city: selectedCity.value,
        country: selectedCity.value.country,
      })
    } else if (selectedCountry.value) {
      userStore.setUser({
        city: {
          id: '',
          name: '',
          country: {
            id: '',
            name: '',
            code: '',
          },
        },
        country: selectedCountry.value,
      })
    }

    userStore.setUser({
      age: ageDraft.value,
      bio: bioDraft.value || undefined,
    })

    // Update user data
    userStore.user = {
      ...userStore.user,
      firstName: userStore.user.firstName,
      lastName: userStore.user.lastName,
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
  uiStore.showToast('Signed out', 'success')
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
        <div class="w-full relative">
          <LocationFlow
            :country="selectedCountry"
            :city="selectedCity"
            :country-input-id="countryInputId"
            :city-input-id="cityInputId"
            variant="auth"
            @update:country="(val) => {
              setSelectedCountry(val)
              setSelectedCity(null)
              userStore.errorMessage = ''
            }"
            @update:city="(val) => {
              setSelectedCity(val)
              userStore.errorMessage = ''
            }"
          />
        </div>
      </div>

      <AuthInput
        v-model.number="ageDraft"
        type="number"
        placeholder="Age (optional)"
        icon="calendar"
        :id="ageInputId"
        @update:model-value="userStore.errorMessage = ''"
      />

      <textarea
        v-model="bioDraft"
        rows="4"
        class="w-full bg-white/20 rounded-xl px-4 py-2 outline-none resize-none text-sm text-white !placeholder-white/80 focus:ring-1 focus:ring-white transition"
        placeholder="Bio (optional)"
        @input="userStore.errorMessage = ''"
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
