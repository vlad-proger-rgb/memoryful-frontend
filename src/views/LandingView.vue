<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import logo from '@/assets/img/logo.svg'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const primaryCtaTarget = computed(() => userStore.isAuthenticated ? '/dashboard' : '/login/welcome')
const primaryCtaLabel = computed(() => userStore.isAuthenticated ? 'Open app' : 'Get started')
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <header class="border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <RouterLink to="/" class="flex items-center gap-3">
          <img :src="logo" alt="Memoryful Logo" class="h-11 w-11 rounded-full" />
          <div>
            <p class="text-lg font-semibold tracking-wide">Memoryful</p>
            <p class="text-xs text-slate-400">Capture your days with intention</p>
          </div>
        </RouterLink>

        <nav class="flex items-center gap-3">
          <RouterLink
            to="/login/welcome"
            class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
          >
            Sign in
          </RouterLink>
          <RouterLink
            :to="primaryCtaTarget"
            class="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {{ primaryCtaLabel }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl flex-col justify-center px-6 py-16">
      <div class="max-w-3xl">
        <p class="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Personal memory journal</p>
        <h1 class="text-5xl font-semibold leading-tight text-white sm:text-6xl">
          Keep your days, thoughts, and tiny wins in one calm place.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Memoryful helps you capture daily moments, organize what matters, and come back to your life with more clarity.
        </p>

        <div class="mt-10 flex flex-wrap gap-4">
          <RouterLink
            :to="primaryCtaTarget"
            class="rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {{ primaryCtaLabel }}
          </RouterLink>
          <RouterLink
            to="/login/welcome"
            class="rounded-full border border-white/15 px-6 py-3 text-base font-medium text-white transition hover:border-white/30 hover:bg-white/5"
          >
            Continue with email
          </RouterLink>
        </div>
      </div>

      <div class="mt-16 grid gap-4 md:grid-cols-3">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p class="text-lg font-semibold">Daily reflection</p>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            Save memories, thoughts, images, and check-ins without turning journaling into work.
          </p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p class="text-lg font-semibold">Structured history</p>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            Browse your year, month, and day views to see how your story unfolds over time.
          </p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p class="text-lg font-semibold">Searchable moments</p>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            Find experiences, tags, and patterns quickly when you want to revisit what mattered.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
