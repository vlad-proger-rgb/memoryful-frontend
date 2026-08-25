<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import logo from '@/assets/img/memoryful-ai-brain.webp'
import privacyMarkdown from '@/content/privacy.md?raw'
import termsMarkdown from '@/content/terms.md?raw'

const documents: Record<string, string> = {
  privacy: privacyMarkdown,
  terms: termsMarkdown,
}

const route = useRoute()
const router = useRouter()
const renderedDocument = computed(() => marked(documents[String(route.name)] ?? '') as string)

// Links inside v-html are plain anchors, so an in-app one would reload the whole SPA.
const routeInternalLinks = (event: MouseEvent) => {
  const anchor = (event.target as HTMLElement).closest('a')
  const href = anchor?.getAttribute('href')
  if (!href?.startsWith('/')) return
  event.preventDefault()
  router.push(href)
}
</script>

<template>
  <div
    class="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)] text-white"
  >
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
      ></div>
      <div
        class="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
      ></div>
    </div>

    <header class="sticky top-0 z-20 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
        <RouterLink to="/" class="flex items-center gap-3">
          <div
            class="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-[0_10px_40px_rgba(14,165,233,0.15)] backdrop-blur-md"
          >
            <img :src="logo" alt="Memoryful Logo" class="h-9 w-9 rounded-xl" />
          </div>
          <p class="text-base font-semibold tracking-wide text-white">Memoryful</p>
        </RouterLink>

        <nav class="flex items-center gap-2 text-sm">
          <RouterLink
            to="/privacy"
            class="rounded-full px-3 py-2 text-slate-300 transition hover:text-white"
            active-class="text-white"
          >
            Privacy
          </RouterLink>
          <RouterLink
            to="/terms"
            class="rounded-full px-3 py-2 text-slate-300 transition hover:text-white"
            active-class="text-white"
          >
            Terms
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-10">
      <article
        class="prose rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-[0_34px_120px_rgba(2,6,23,0.32)] backdrop-blur-2xl md:p-10"
        v-html="renderedDocument"
        @click="routeInternalLinks"
      ></article>

      <RouterLink
        to="/"
        class="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        Back to home
      </RouterLink>
    </main>
  </div>
</template>
