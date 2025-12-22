<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useShake } from '@/composables'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'

const userStore = useUserStore()
const code = ref<string>('')
const router = useRouter()
const { shakeElement } = useShake()

onMounted(() => {
  if (!userStore.user.email) {
    router.push('/login')
  }
  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  }
})

const handleConfirm = async () => {
  if (!code.value) {
    userStore.errorMessage = 'Please enter the verification code'
    shakeElement('code-input-container')
    return
  }

  if (code.value.length !== 6) {
    userStore.errorMessage = 'Please enter a valid 6-digit verification code'
    shakeElement('code-input-container')
    return
  }

  const result = await userStore.verifyCode(code.value)
  if (result === false) {
    shakeElement('code-input-container')
    return
  }

  const [success, isNewUser] = result
  if (!success) {
    shakeElement('code-input-container')
    return
  }
  if (isNewUser || !userStore.isProfileComplete) {
    await router.push('/login/details')
    return
  }

  await router.push('/dashboard')
}
</script>

<template>
  <AuthCard
    title="Enter Code"
    :subtitle="`We've sent a verification code to ${userStore.user.email}`"
  >
    <div class="w-full flex justify-center flex-col gap-4">
      <div id="code-input-container">
        <AuthInput
          v-model="code"
          type="text"
          placeholder="Your Code"
          icon="lock"
          input-mode="numeric"
          pattern="[0-9]*"
          :has-error="!!userStore.errorMessage"
          @update:model-value="userStore.errorMessage = ''"
        />
      </div>

      <p v-if="userStore.errorMessage" class="text-red-400 text-sm ml-2">
        {{ userStore.errorMessage }}
      </p>

      <AuthButton
        :loading="userStore.isLoading"
        :has-error="!!userStore.errorMessage"
        :disabled="userStore.isLoading"
        @click="handleConfirm"
      >
        <template #default>Confirm</template>
        <template #icon-right v-if="!userStore.isLoading">
          <font-awesome-icon icon="angle-double-right" />
        </template>
        <template #icon-right v-else>
          <font-awesome-icon icon="circle-notch" class="animate-spin" />
        </template>
      </AuthButton>

      <div class="flex justify-between w-full mt-2">
        <AuthButton variant="link" @click="router.push('/login')"> Back </AuthButton>

        <AuthButton
          variant="link"
          @click="userStore.requestVerificationCode()"
          :disabled="userStore.isLoading"
        >
          Resend Code
        </AuthButton>
      </div>
    </div>
  </AuthCard>
</template>
