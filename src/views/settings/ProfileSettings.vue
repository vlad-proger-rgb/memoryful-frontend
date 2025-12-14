<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { useLocation } from '@/composables'
import LocationFlow from '@/components/ui/LocationFlow.vue'

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
        <input
          v-model="displayNameDraft"
          type="text"
          class="w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none text-sm"
          placeholder="Your name"
        />
      </div>

      <div>
        <p class="text-sm mb-2 opacity-80">Age</p>
        <input
          v-model.number="ageDraft"
          type="number"
          min="0"
          max="130"
          class="w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none text-sm"
          placeholder="Your age"
        />
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
        <textarea
          v-model="bioDraft"
          rows="5"
          class="w-full bg-black/20 border border-white/15 rounded-xl px-3 py-2 outline-none resize-none text-sm"
          placeholder="Tell Memoryful a bit about you (hobbies, context, preferences)..."
        />
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="text-sm">
          <p v-if="userStore.errorMessage" class="text-red-300">{{ userStore.errorMessage }}</p>
        </div>

        <button
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 rounded-full px-5 py-2 text-sm flex items-center gap-2"
          :disabled="userStore.isLoading"
          @click="saveProfile"
        >
          <font-awesome-icon v-if="userStore.isLoading" icon="circle-notch" class="animate-spin" />
          <font-awesome-icon v-else icon="floppy-disk" />
          Save
        </button>
      </div>
    </section>
  </div>
</template>
