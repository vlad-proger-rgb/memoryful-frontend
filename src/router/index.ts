import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/LandingView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/calendar/',
      redirect: `/calendar/${new Date().getFullYear()}`,
    },
    {
      path: '/calendar/:year(\\d{4})',
      name: 'year',
      component: () => import('../views/YearView.vue'),
    },
    {
      path: '/calendar/:year(\\d{4})/:month(\\d{1,2})',
      name: 'month',
      component: () => import('../views/MonthView.vue'),
    },
    {
      path: '/calendar/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})',
      name: 'day',
      component: () => import('../views/DayView.vue'),
    },
    {
      path: '/settings',
      component: () => import('../views/SettingsView.vue'),
      children: [
        {
          path: '',
          redirect: '/settings/profile',
        },
        {
          path: 'profile',
          name: 'settings-profile',
          component: () => import('../views/settings/ProfileSettings.vue'),
        },
        {
          path: 'account',
          name: 'settings-account',
          component: () => import('../views/settings/AccountSettings.vue'),
        },
        {
          path: 'connected-apps',
          name: 'settings-connected-apps',
          component: () => import('../views/settings/ConnectedApps.vue'),
        },
      ],
    },
  ],
})

export default router
