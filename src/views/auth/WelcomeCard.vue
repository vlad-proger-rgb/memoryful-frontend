<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthUtils } from '@/composables'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'

const userStore = useUserStore()
const router = useRouter()
const { isValidEmail, shakeElement } = useAuthUtils()

onMounted(async () => {
  await userStore.initializeFromStorage()

  if (userStore.isAuthenticated) {
    await router.push('/dashboard')
  }
})

const handleContinue = async () => {
  userStore.errorMessage = ''

  if (!userStore.user.email) {
    userStore.errorMessage = 'Please enter your email address'
    shakeElement('email-input-container')
    return
  }

  if (!isValidEmail(userStore.user.email)) {
    userStore.errorMessage = 'Please enter a valid email address'
    shakeElement('email-input-container')
    return
  }

  const success = await userStore.requestVerificationCode()
  if (success) {
    await router.push('/login/code-verification')
  } else {
    shakeElement('email-input-container')
  }
}
</script>

<template>
  <AuthCard title="Welcome!">
    <div class="w-full" id="email-input-container">
      <AuthInput
        v-model="userStore.user.email"
        type="email"
        placeholder="Your Email"
        icon="envelope"
        :has-error="!!userStore.errorMessage"
        @update:model-value="userStore.errorMessage = ''"
      />
    </div>

    <p v-if="userStore.errorMessage" class="text-red-400 text-sm -mt-4 self-start ml-2">
      {{ userStore.errorMessage }}
    </p>

    <AuthButton
      :loading="userStore.isLoading"
      :has-error="!!userStore.errorMessage"
      :disabled="userStore.isLoading"
      @click="handleContinue"
    >
      <template #default>Continue</template>
      <template #icon-right v-if="!userStore.isLoading">
        <font-awesome-icon icon="angle-double-right" />
      </template>
      <template #icon-right v-else>
        <font-awesome-icon icon="circle-notch" class="animate-spin" />
      </template>
    </AuthButton>

    <p class="text-white/70">Or Sign In with</p>
    <div class="flex gap-6 text-3xl">
      <font-awesome-icon :icon="['fab', 'google']" />
      <font-awesome-icon :icon="['fab', 'microsoft']" />
      <font-awesome-icon :icon="['fab', 'apple']" />
    </div>
  </AuthCard>
</template>
