import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import { setAuthFailureHandler, setAuthToken } from '@/api/client'
import { useFeatureFlagsStore } from '@/stores/featureFlags'
import { useUserStore } from '@/stores/user'

import './assets/main.css'

import AppIcon from '@/components/ui/AppIcon.vue'

const app = createApp(App)

app.use(createPinia())

useFeatureFlagsStore().hydrate()

app.use(router)

app.component('font-awesome-icon', AppIcon)

const accessToken = sessionStorage.getItem('accessToken')
if (accessToken) {
  setAuthToken(accessToken)
}

setAuthFailureHandler(() => {
  useUserStore().clearUser()
  router.replace({ name: 'landing' })
})

app.mount('#app')
