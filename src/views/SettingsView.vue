<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'

import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import fallbackAvatar from '@/assets/img/avatar-fallback.webp'
import useWorkspaceStore from '@/stores/workspace'

import SettingsSectionButton from '@/components/ui/SettingsSectionButton.vue'
import MediaBackground from '@/components/ui/MediaBackground.vue'

import { useStorageResolve, useStorageUpload } from '@/composables'

const userStore = useUserStore()
const uiStore = useUiStore()
const workspaceStore = useWorkspaceStore()
const router = useRouter()

uiStore.disableScroll = false

const displayName = computed(() => userStore.user.firstName || 'User')

const { resolveStorageSrc } = useStorageResolve()
const { uploadToStorage } = useStorageUpload()

const settingsBackground = computed(() => workspaceStore.backgrounds.settings)

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

const isLoggingOut = ref(false)

const sections = [
  { to: '/settings/account', label: 'Manage Account', icon: 'user' },
  { to: '/settings/profile', label: 'Manage Profile', icon: 'id-card' },
  { to: '/settings/workspace', label: 'Workspace', icon: 'paintbrush' },
  { to: '/settings/ai', label: 'AI', icon: 'robot' },
  { to: '/settings/tags-trackables', label: 'Tags & Trackables', icon: 'tags' },
  { to: '/settings/connected-apps', label: 'Extensions (soon)', icon: 'sliders' },
] as const

const route = useRoute()
const sectionNav = ref<HTMLElement | null>(null)

// The nav is a horizontal scroller below md, so the active section can start out off-screen.
const revealActiveSection = () => {
  const nav = sectionNav.value
  if (!nav || nav.scrollWidth <= nav.clientWidth) return
  nav.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
}

onMounted(revealActiveSection)
watch(() => route.path, revealActiveSection, { flush: 'post' })

const handleLogout = async () => {
  if (isLoggingOut.value) return

  const confirmed = window.confirm('Are you sure you want to sign out?')
  if (!confirmed) return

  isLoggingOut.value = true
  try {
    await userStore.logout()
    uiStore.showToast('Signed out', 'success')
    await router.push('/login')
  } catch (e: unknown) {
    console.error('Failed to sign out:', e)
    const maybeErr = e as { message?: string }
    uiStore.showToast(maybeErr?.message || 'Failed to sign out', 'error')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div
    class="min-h-[calc(100dvh-var(--bottom-nav-total))] md:min-h-[calc(100dvh-var(--app-header-height))] text-white"
  >
    <MediaBackground
      :src="settingsBackground.url ?? null"
      :is-video="settingsBackground.isVideo"
      :poster-url="settingsBackground.posterUrl"
      :placeholder="settingsBackground.placeholder"
      container-class="fixed inset-0 -z-10"
    />

    <div class="w-full max-w-[1200px] mx-auto px-4">
      <div
        class="md:sticky md:top-[var(--app-header-height)] z-20 pt-4 pb-4 md:pt-6 flex items-center justify-between pointer-events-none"
      >
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-20 h-20 md:w-[120px] md:h-[120px] shrink-0 rounded-full overflow-hidden">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarSelected"
            />
            <img
              :src="avatarResolvedSrc"
              alt=""
              class="w-full h-full object-cover cursor-pointer transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 pointer-events-auto"
              tabindex="0"
              @click="handleAvatarPick"
              @keydown.enter.prevent="handleAvatarPick"
              @keydown.space.prevent="handleAvatarPick"
            />
          </div>
          <div class="min-w-0">
            <p class="text-base md:text-lg leading-normal">Welcome,</p>
            <p class="text-xl md:text-2xl font-bold leading-normal truncate">{{ displayName }}</p>
          </div>
        </div>

        <button
          class="pointer-events-auto shrink-0 backdrop-blur-[17.5px] bg-[rgba(191,47,47,0.2)] border border-red-400 px-4 py-2 min-h-11 md:min-h-0 rounded-full flex items-center gap-2 text-base text-red-300 [text-shadow:0_1px_3px_rgb(0_0_0/0.7)] transition-transform duration-150 ease-out hover:scale-[1.03] hover:ring-2 hover:ring-red-400/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 disabled:hover:ring-0"
          @click="handleLogout"
          :disabled="isLoggingOut"
        >
          <span class="text-sm font-semibold whitespace-nowrap">
            {{ isLoggingOut ? 'Signing out…' : 'Sign out' }}
          </span>
          <span class="flex items-center">
            <svg
              v-if="isLoggingOut"
              class="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <font-awesome-icon v-else icon="right-from-bracket" class="text-sm" />
          </span>
        </button>
      </div>

      <div class="flex flex-col gap-6 md:flex-row md:items-start pb-8">
        <!-- py-1 is not spacing: overflow-x-auto forces overflow-y to auto, which would clip the active pill's ring. -->
        <nav
          ref="sectionNav"
          class="flex gap-2 overflow-x-auto -mx-4 px-4 py-1 md:mx-0 md:px-0 md:py-0 md:w-[240px] md:shrink-0 md:sticky md:top-[calc(var(--app-header-height)+144px)] md:flex-col md:gap-3 md:overflow-visible"
        >
          <SettingsSectionButton
            v-for="s in sections"
            :key="s.to"
            :to="s.to"
            :label="s.label"
            :icon="s.icon"
          />
        </nav>

        <main class="w-full min-w-0 md:flex-1">
          <div
            class="backdrop-blur-[17.5px] bg-[rgba(255,255,255,0.2)] rounded-3xl overflow-hidden px-4 py-5 md:px-6 md:py-6"
          >
            <RouterView />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
