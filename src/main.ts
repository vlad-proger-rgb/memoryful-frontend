import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import { setAuthToken } from '@/api/client'

import './assets/main.css'

import { FontAwesomeIcon } from '@/plugins/fontawesome'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)

const accessToken = sessionStorage.getItem('accessToken')
if (accessToken) {
  setAuthToken(accessToken)
}

app.mount('#app')
