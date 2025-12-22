<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { useLocation } from '@/composables'
import LocationFlow from '@/components/ui/LocationFlow.vue'
import SettingsButton from '@/components/ui/SettingsButton.vue'
import SettingsInput from '@/components/ui/SettingsInput.vue'
import SettingsTextarea from '@/components/ui/SettingsTextarea.vue'

const userStore = useUserStore()
const uiStore = useUiStore()

const {
  selectedCountry,
  selectedCity,
  setSelectedCountry,
  setSelectedCity,
} = useLocation()

const countryInputId = 'settings-country-input'
const cityInputId = 'settings-city-input'

const displayNameDraft = ref('')
const ageDraft = ref<number | null>(null)
const bioDraft = ref('')

const hydrateLocationFromUser = () => {
  if (!selectedCity.value?.id && userStore.user.city?.id) {
    setSelectedCity(userStore.user.city)
  }

  if (!selectedCountry.value?.id) {
    if (userStore.user.city?.country?.id) {
      setSelectedCountry(userStore.user.city.country)
    } else if (userStore.user.country?.id) {
      setSelectedCountry(userStore.user.country)
    }
  }
}

onMounted(() => {
  displayNameDraft.value = userStore.user.firstName || ''
  ageDraft.value = typeof userStore.user.age === 'number' ? userStore.user.age : null
  bioDraft.value = userStore.user.bio || ''
  hydrateLocationFromUser()
})

watch(
  [
    () => userStore.user.city?.id,
    () => userStore.user.city?.country?.id,
    () => userStore.user.country?.id,
  ],
  () => {
    hydrateLocationFromUser()
  },
  { immediate: true },
)

const saveProfile = async () => {
  userStore.errorMessage = ''

  if (selectedCity.value) {
    userStore.setUser({
      firstName: displayNameDraft.value,
      age: ageDraft.value ?? undefined,
      city: selectedCity.value,
      country: selectedCity.value.country,
      bio: bioDraft.value,
    })
  } else {
    userStore.setUser({
      firstName: displayNameDraft.value,
      age: ageDraft.value ?? undefined,
      city: {
        id: '',
        name: '',
        country: {
          id: '',
          name: '',
          code: '',
        },
      },
      country: selectedCountry.value || undefined,
      bio: bioDraft.value,
    })
  }

  const ok = await userStore.updateUserProfile()
  if (ok) {
    uiStore.showToast('Saved', 'success')
    await userStore.fetchUserDetails()
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="text-xl font-semibold">Profile</p>
      <p class="text-sm opacity-80">Update your home location and short description.</p>
    </div>

    <section class="backdrop-blur-[17.5px] bg-white/10 rounded-2xl p-4 flex flex-col gap-4">
      <div>
        <p class="text-sm mb-2 opacity-80">Display name</p>
        <SettingsInput v-model="displayNameDraft" type="text" placeholder="Your name" />
      </div>

      <div>
        <p class="text-sm mb-2 opacity-80">Age</p>
        <SettingsInput v-model.number="ageDraft" type="number" min="0" max="130" placeholder="Your age" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LocationFlow
          :country="selectedCountry"
          :city="selectedCity"
          :country-input-id="countryInputId"
          :city-input-id="cityInputId"
          variant="settings"
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

      <div>
        <p class="text-sm mb-2 opacity-80">Description</p>
        <SettingsTextarea
          v-model="bioDraft"
          rows="5"
          placeholder="Tell Memoryful a bit about you (hobbies, context, preferences)..."
        />
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="text-sm">
          <p v-if="userStore.errorMessage" class="text-red-300">{{ userStore.errorMessage }}</p>
        </div>

        <SettingsButton
          preset="primary"
          label="Save"
          icon="floppy-disk"
          :loading="userStore.isLoading"
          :disabled="userStore.isLoading"
          @click="saveProfile"
        />
      </div>
    </section>
  </div>
</template>
