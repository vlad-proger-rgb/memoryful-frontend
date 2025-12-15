<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'

import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import bgImage from '@/assets/img/day_bg.jpg'
import fallbackAvatar from '@/assets/img/animal1.jpg'

import { useStorageResolve, useStorageUpload } from '@/composables'

const userStore = useUserStore()
const uiStore = useUiStore()
const router = useRouter()

uiStore.disableScroll = false

const displayName = computed(() => userStore.user.firstName || 'User')

const { resolveStorageSrc } = useStorageResolve()
const { uploadToStorage } = useStorageUpload()

const avatarResolvedSrc = ref<string>(fallbackAvatar)
watch(
  () => userStore.user.photo,
  async (next) => {
    const resolved = await resolveStorageSrc(next)
    avatarResolvedSrc.value = resolved || fallbackAvatar
  },
  { immediate: true },
)

const fileInput = ref<HTMLInputElement | null>(null)

const handleAvatarPick = () => {
  fileInput.value?.click()
}

const handleAvatarSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  try {
    const file = input.files[0]
    const objectKey = await uploadToStorage({ file, intent: 'avatar' })
    userStore.setUser({ photo: objectKey })

    const ok = await userStore.updateUserProfile()
    if (!ok) {
      uiStore.showToast(userStore.errorMessage || 'Failed to update avatar', 'error')
      return
    }

    await userStore.fetchUserDetails()
    uiStore.showToast('Avatar updated', 'success')
  } catch (e: unknown) {
    console.error('Failed to upload avatar:', e)
    const maybeErr = e as { message?: string }
    uiStore.showToast(maybeErr?.message || 'Failed to upload avatar', 'error')
  } finally {
    if (input) input.value = ''
  }
}

const handleLogout = async () => {
  await userStore.logout()
  uiStore.showToast('Signed out', 'success')
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-[calc(100vh-60px)] text-white">
    <div
      class="fixed inset-0 -z-10 bg-center bg-cover"
      :style="{ backgroundImage: `url(${bgImage})` }"
    />

    <div class="w-full max-w-[1200px] mx-auto px-4">
      <div class="pt-6 pb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-[120px] h-[120px] rounded-full overflow-hidden">
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarSelected" />
            <img
              :src="avatarResolvedSrc"
              alt=""
              class="w-full h-full object-cover cursor-pointer"
              @click="handleAvatarPick"
            />
          </div>
          <div>
            <p class="text-lg leading-normal">Welcome,</p>
            <p class="text-2xl font-bold leading-normal">{{ displayName }}</p>
          </div>
        </div>

        <button
          class="backdrop-blur-[17.5px] bg-[rgba(191,47,47,0.2)] border border-red-500 px-4 py-2 rounded-full flex items-center gap-2 text-base text-[#bf2f2f]"
          @click="handleLogout"
        >
          Sign out
          <font-awesome-icon icon="right-from-bracket" class="text-sm" />
        </button>
      </div>

      <div class="flex gap-6 items-start pb-8">
        <aside class="w-[240px] flex flex-col gap-3">
          <RouterLink
            to="/settings/account"
            class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] px-4 py-2 rounded-full flex items-center justify-between"
            active-class="ring-2 ring-white/50"
          >
            <span class="text-sm">Manage Account</span>
            <font-awesome-icon icon="user" class="text-sm" />
          </RouterLink>

          <RouterLink
            to="/settings/profile"
            class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] px-4 py-2 rounded-full flex items-center justify-between"
            active-class="ring-2 ring-white/50"
          >
            <span class="text-sm">Manage Profile</span>
            <font-awesome-icon icon="id-card" class="text-sm" />
          </RouterLink>

          <RouterLink
            to="/settings/workspace"
            class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] px-4 py-2 rounded-full flex items-center justify-between"
            active-class="ring-2 ring-white/50"
          >
            <span class="text-sm">Workspace</span>
            <font-awesome-icon icon="paintbrush" class="text-sm" />
          </RouterLink>

          <RouterLink
            to="/settings/ai"
            class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] px-4 py-2 rounded-full flex items-center justify-between"
            active-class="ring-2 ring-white/50"
          >
            <span class="text-sm">AI</span>
            <font-awesome-icon icon="robot" class="text-sm" />
          </RouterLink>

          <RouterLink
            to="/settings/connected-apps"
            class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] px-4 py-2 rounded-full flex items-center justify-between"
            active-class="ring-2 ring-white/50"
          >
            <span class="text-sm">Extensions (soon)</span>
            <font-awesome-icon icon="sliders" class="text-sm" />
          </RouterLink>
        </aside>

        <main class="flex-1">
          <div class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] rounded-3xl overflow-hidden px-6 py-6">
            <RouterView />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
