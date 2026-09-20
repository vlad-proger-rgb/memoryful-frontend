<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import sessionsApi from '@/api/sessions'
  import { useUiStore } from '@/stores/ui'
  import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
  import SettingsButton from '@/components/ui/SettingsButton.vue'
  import { useUserStore } from '@/stores/user'
  import type { ApiResponse, Session } from '@/types'

  const isLoading = ref(false)
  const errorMessage = ref<string>('')
  const sessions = ref<Session[]>([])
  const revokingSessionIds = ref<Set<string>>(new Set())
  const uiStore = useUiStore()
  const userStore = useUserStore()
  const router = useRouter()

  const isSignOutDialogOpen = ref(false)
  const isSigningOutEverywhere = ref(false)

  const formatDateTime = (isoOrDate: string) => {
    const d = new Date(isoOrDate)
    return Number.isNaN(d.getTime()) ? isoOrDate : d.toLocaleString()
  }

  const signOutEverywhere = async () => {
    isSignOutDialogOpen.value = false

    if (isSigningOutEverywhere.value) return
    isSigningOutEverywhere.value = true
    errorMessage.value = ''
    try {
      const res = await sessionsApi.logoutAll()
      if (res.code === 200) {
        uiStore.showToast('Signed out of every device', 'info')
        userStore.clearUser()
        await router.push('/login')
      } else {
        errorMessage.value = res.msg || 'Failed to sign out everywhere'
      }
    } catch (e: unknown) {
      errorMessage.value = getErrorMessage(e) || 'Failed to sign out everywhere'
    } finally {
      isSigningOutEverywhere.value = false
    }
  }

  const normalizeUa = (ua: string | null | undefined) => (ua || '').toLowerCase()

  const getSessionIcon = (ua: string | null | undefined) => {
    const v = normalizeUa(ua)
    if (!v) return 'question'
    if (v.includes('android') || v.includes('iphone') || v.includes('ipad') || v.includes('mobile')) return 'mobile-screen-button'
    if (v.includes('windows') || v.includes('mac os') || v.includes('linux') || v.includes('x11')) return 'desktop'
    return 'globe'
  }

  const getSessionLabel = (ua: string | null | undefined) => {
    const v = normalizeUa(ua)
    if (!v) return 'Unknown device'
    if (v.includes('android')) return 'Android'
    if (v.includes('iphone') || v.includes('ipad')) return 'iOS'
    if (v.includes('windows')) return 'Windows'
    if (v.includes('mac os')) return 'macOS'
    if (v.includes('linux') || v.includes('x11')) return 'Linux'
    return 'Browser'
  }

  const getErrorMessage = (e: unknown) => {
    if (e && typeof e === 'object' && 'msg' in e) {
      return String((e as ApiResponse).msg || 'Unknown error')
    }
    return 'Unknown error'
  }

  const loadSessions = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await sessionsApi.listSessions()
      if (res.code === 200 && res.data) {
        sessions.value = res.data
      } else {
        errorMessage.value = res.msg || 'Failed to load sessions'
      }
    } catch (e: unknown) {
      errorMessage.value = getErrorMessage(e) || 'Failed to load sessions'
    } finally {
      isLoading.value = false
    }
  }

  const revoke = async (sessionId: string) => {
    if (revokingSessionIds.value.has(sessionId)) return

    const ok = window.confirm('Revoke this session?')
    if (!ok) return

    revokingSessionIds.value.add(sessionId)
    errorMessage.value = ''
    try {
      const res = await sessionsApi.revokeSession(sessionId)
      if (res.code === 200) {
        sessions.value = sessions.value.filter((s) => s.id !== sessionId)
        uiStore.showToast('Session revoked', 'success')
      } else {
        errorMessage.value = res.msg || 'Failed to revoke session'
      }
    } catch (e: unknown) {
      errorMessage.value = getErrorMessage(e) || 'Failed to revoke session'
    } finally {
      revokingSessionIds.value.delete(sessionId)
    }
  }

  onMounted(() => {
    void loadSessions()
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-lg font-semibold">Active sessions</p>
        <p class="text-xs opacity-80">Sign out other sessions to protect your account.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <SettingsButton preset="refresh" :disabled="isLoading" @click="loadSessions" />
        <SettingsButton
          preset="pill"
          tone="danger"
          icon="right-from-bracket"
          label="Sign out everywhere"
          :disabled="isLoading || isSigningOutEverywhere || !sessions.length"
          @click="isSignOutDialogOpen = true"
        />
      </div>
    </div>

    <p v-if="errorMessage" class="text-red-300 text-sm">{{ errorMessage }}</p>

    <div v-if="isLoading" class="text-sm opacity-80">Loading…</div>

    <div v-else-if="!sessions.length" class="text-sm opacity-80">No sessions found.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="backdrop-blur-[17.5px] rounded-2xl p-4 flex flex-col gap-3 transition-transform duration-150 ease-out"
        :class="s.isCurrent ? 'bg-emerald-500/15 ring-2 ring-emerald-400/50 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]' : 'bg-white/15'"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center">
              <font-awesome-icon :icon="getSessionIcon(s.userAgent)" class="text-lg" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 min-w-0">
                <p class="font-semibold truncate">{{ getSessionLabel(s.userAgent) }}</p>
                <span
                  v-if="s.isCurrent"
                  class="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-100"
                >
                  Current
                </span>
              </div>
              <p class="text-xs opacity-80 truncate">{{ s.ipAddress || 'IP unknown' }}</p>
            </div>
          </div>

          <SettingsButton
            v-if="!s.isCurrent"
            preset="session"
            tone="danger"
            :disabled="revokingSessionIds.has(s.id)"
            @click="revoke(s.id)"
          >
            <span v-if="revokingSessionIds.has(s.id)">Revoking…</span>
            <span v-else>Revoke</span>
          </SettingsButton>
        </div>

        <div class="text-xs opacity-80 leading-relaxed">
          <p><span class="opacity-70">Created:</span> {{ formatDateTime(s.createdAt) }}</p>
          <p><span class="opacity-70">Expires:</span> {{ formatDateTime(s.expiresAt) }}</p>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="isSignOutDialogOpen"
      title="Sign out everywhere?"
      message="This revokes every session, including this one. You will need to log in again on each device."
      confirm-label="Sign out everywhere"
      :busy="isSigningOutEverywhere"
      @update:show="isSignOutDialogOpen = $event"
      @confirm="signOutEverywhere"
    >
      <p class="mt-2 text-xs text-white/50">
        {{ sessions.length }} {{ sessions.length === 1 ? 'session' : 'sessions' }} will be signed
        out.
      </p>
    </ConfirmDialog>
  </div>
</template>
