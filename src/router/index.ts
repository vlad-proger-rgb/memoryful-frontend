import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    guestOnly?: boolean
    appShell?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: {
        appShell: false,
        public: true,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthView.vue'),
      redirect: '/login/welcome',
      meta: {
        appShell: false,
        public: true,
        guestOnly: true,
      },
      children: [
        {
          path: 'welcome',
          component: () => import('@/views/auth/WelcomeCard.vue'),
          meta: {
            appShell: false,
          },
        },
        {
          path: 'code-verification',
          component: () => import('@/views/auth/CodeVerification.vue'),
          meta: {
            appShell: false,
          },
        },
        {
          path: 'details',
          component: () => import('@/views/auth/ProfileForm.vue'),
          meta: {
            public: false,
            guestOnly: false,
          },
        },
      ],
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('@/views/AiView.vue'),
    },
    {
      path: '/calendar/',
      redirect: `/calendar/${new Date().getFullYear()}`,
    },
    {
      path: '/calendar/:year(\\d{4})',
      name: 'year',
      component: () => import('@/views/YearView.vue'),
    },
    {
      path: '/calendar/:year(\\d{4})/:month(\\d{1,2})',
      name: 'month',
      component: () => import('@/views/MonthView.vue'),
    },
    {
      path: '/calendar/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})',
      name: 'day',
      component: () => import('@/views/DayView.vue'),
    },
    {
      path: '/settings',
      component: () => import('@/views/SettingsView.vue'),
      children: [
        {
          path: '',
          redirect: '/settings/profile',
        },
        {
          path: 'profile',
          name: 'settings-profile',
          component: () => import('@/views/settings/ProfileSettings.vue'),
        },
        {
          path: 'account',
          name: 'settings-account',
          component: () => import('@/views/settings/AccountSettings.vue'),
        },
        {
          path: 'connected-apps',
          name: 'settings-connected-apps',
          component: () => import('@/views/settings/ConnectedApps.vue'),
        },
        {
          path: 'workspace',
          name: 'settings-workspace',
          component: () => import('@/views/settings/WorkspaceSettings.vue'),
        },
        {
          path: 'ai',
          name: 'settings-ai',
          component: () => import('@/views/settings/AiSettings.vue'),
        },
        {
          path: 'tags-trackables',
          name: 'settings-tags-trackables',
          component: () => import('@/views/settings/TagsTrackablesSettings.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  await userStore.restoreSession()

  if (to.meta.guestOnly && userStore.isAuthenticated) return { name: 'dashboard' }
  if (!to.meta.public && !userStore.isAuthenticated) return { name: 'landing' }
})

export default router
