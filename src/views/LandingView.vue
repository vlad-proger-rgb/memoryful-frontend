<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingParticleOrb from '@/components/LandingParticleOrb.vue'
import logo from '@/assets/img/memoryful-ai-brain.png'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const primaryCtaTarget = computed(() => userStore.isAuthenticated ? '/dashboard' : '/login/welcome')
const primaryCtaLabel = computed(() => userStore.isAuthenticated ? 'Open app' : 'Get started')
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)] text-white">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"></div>
      <div class="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
      <div class="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>
    </div>

    <header class="sticky top-0 z-20 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-[0_10px_40px_rgba(14,165,233,0.15)] backdrop-blur-md">
            <img :src="logo" alt="Memoryful Logo" class="h-9 w-9 rounded-xl" />
          </div>
          <div>
            <p class="text-base font-semibold tracking-wide text-white">Memoryful</p>
            <p class="text-[11px] text-slate-300">Write your Today. Improve your Tomorrow.</p>
          </div>
        </RouterLink>

        <nav class="flex items-center gap-3">
          <RouterLink
            to="/login/welcome"
            class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            Sign in
          </RouterLink>
          <RouterLink
            :to="primaryCtaTarget"
            class="rounded-full border border-cyan-300/40 bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(34,211,238,0.26)] transition hover:bg-cyan-300"
          >
            {{ primaryCtaLabel }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8 lg:pt-10">
      <section class="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-14">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 backdrop-blur-md">
            In development
          </div>

          <div class="mt-6 space-y-3">
            <p class="text-4xl font-semibold leading-none text-white sm:text-5xl xl:text-6xl">
              Write your Today.
            </p>
            <p class="max-w-xl text-sm font-medium leading-6 text-cyan-100/72 sm:text-base sm:leading-7 xl:text-lg">
              Let memory become structure, insight, and reflection.
            </p>
            <p class="text-4xl font-semibold leading-none text-white sm:text-5xl xl:text-6xl">
              Improve your Tomorrow.
            </p>
          </div>

          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            A private space to capture your days, enrich them with signals from the tools you already use, and come back later to patterns, meaning, and clarity instead of noise.
          </p>

          <div class="mt-10 flex flex-wrap gap-4">
            <RouterLink
              :to="primaryCtaTarget"
              class="cta-button group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-base font-semibold text-slate-950 transition duration-500"
            >
              <span class="cta-button__glow"></span>
              <span class="cta-button__shine"></span>
              <span class="relative z-10">{{ primaryCtaLabel }}</span>
            </RouterLink>
            <RouterLink
              to="/login/welcome"
              class="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white backdrop-blur-md transition duration-300 hover:border-white/30 hover:bg-white/10"
            >
              Continue
            </RouterLink>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl transition duration-300">
              <p class="text-sm text-slate-400">Designed for</p>
              <p class="mt-2 font-semibold text-white">Long-term thinkers</p>
            </div>
            <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl transition duration-300">
              <p class="text-sm text-slate-400">Built around</p>
              <p class="mt-2 font-semibold text-white">Structured reflection</p>
            </div>
            <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl transition duration-300">
              <p class="text-sm text-slate-400">Focused on</p>
              <p class="mt-2 font-semibold text-white">Insight over noise</p>
            </div>
          </div>
        </div>

        <div class="relative lg:pl-2 xl:pl-6">
          <div class="hero-visual relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/8 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition duration-500">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_50%)]"></div>
            <div class="relative flex min-h-[32rem] flex-col items-center justify-center gap-5 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-6">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_38%),radial-gradient(circle_at_70%_30%,rgba(217,70,239,0.08),transparent_28%)]"></div>

              <div class="relative flex h-[18rem] w-full items-center justify-center sm:h-[21rem]">
                <LandingParticleOrb />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-24 grid gap-6 lg:grid-cols-3">
        <div class="glass-focus rounded-[2rem] border border-white/10 bg-white/8 p-7 backdrop-blur-2xl transition duration-300">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Why it exists</p>
          <h2 class="mt-4 text-2xl font-semibold text-white">Life data is scattered. Memory is not reliable.</h2>
          <p class="mt-4 leading-7 text-slate-300">
            Memoryful brings fragmented moments, habits, and activity signals into one calm system, so your history becomes easier to revisit, understand, and learn from.
          </p>
        </div>

        <div class="glass-focus rounded-[2rem] border border-white/10 bg-white/8 p-7 backdrop-blur-2xl transition duration-300">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">What makes it different</p>
          <h2 class="mt-4 text-2xl font-semibold text-white">Whole-life context, not just journaling</h2>
          <p class="mt-4 leading-7 text-slate-300">
            Your day entry is one layer. Extensions from apps like Google or Samsung Health, Steam, GitHub, or WakaTime can add supplemental trackables so Memoryful can analyze life as a whole, not just a single domain.
          </p>
        </div>

        <div class="glass-focus rounded-[2rem] border border-white/10 bg-white/8 p-7 backdrop-blur-2xl transition duration-300">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">What you get back</p>
          <h2 class="mt-4 text-2xl font-semibold text-white">Reflection that becomes actionable</h2>
          <p class="mt-4 leading-7 text-slate-300">
            Over time, your archive becomes a source of summaries, trends, behavior signals, and clearer context for decisions.
          </p>
        </div>
      </section>

      <section class="glass-focus mt-24 rounded-[2rem] border border-white/10 bg-white/7 p-8 backdrop-blur-2xl transition duration-300 lg:p-10">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Core principles</p>
          <h2 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Built for reflection, privacy, and long-term clarity.
          </h2>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-6 transition duration-300">
            <p class="text-lg font-semibold text-white">Private by default</p>
            <p class="mt-3 text-sm leading-6 text-slate-300">No public profiles, no engagement loops, no social pressure.</p>
          </div>
          <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-6 transition duration-300">
            <p class="text-lg font-semibold text-white">Structured memory</p>
            <p class="mt-3 text-sm leading-6 text-slate-300">Capture context around each day so your archive has shape, not just text.</p>
          </div>
          <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-6 transition duration-300">
            <p class="text-lg font-semibold text-white">AI-assisted insight</p>
            <p class="mt-3 text-sm leading-6 text-slate-300">Use summaries and patterns as support, not as noise or gimmickry.</p>
          </div>
          <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-6 transition duration-300">
            <p class="text-lg font-semibold text-white">Long-term thinking</p>
            <p class="mt-3 text-sm leading-6 text-slate-300">A system that becomes more valuable as your life data accumulates.</p>
          </div>
        </div>
      </section>

      <section class="mt-24 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div class="glass-focus rounded-[2rem] border border-white/10 bg-white/8 p-8 backdrop-blur-2xl transition duration-300">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Ask better questions</p>
          <h2 class="mt-4 text-3xl font-semibold text-white">Your past becomes queryable, not forgotten.</h2>
          <p class="mt-4 leading-7 text-slate-300">
            Return to your history with questions about places, periods, habits, and changes. The goal is not just to record life, but to understand it.
          </p>

          <div class="mt-8 space-y-3">
            <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-200 transition duration-300">When did I first visit a certain place?</div>
            <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-200 transition duration-300">What periods felt the most productive?</div>
            <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-slate-200 transition duration-300">Which habits keep showing up in better months?</div>
          </div>
        </div>

        <div class="glass-focus rounded-[2rem] border border-white/10 bg-white/8 p-8 backdrop-blur-2xl transition duration-300">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Concept</p>
          <h2 class="mt-4 text-3xl font-semibold text-white">From raw daily experience to actionable intelligence.</h2>
          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-5 transition duration-300">
              <p class="text-sm text-slate-400">01</p>
              <p class="mt-2 text-lg font-semibold text-white">Capture</p>
              <p class="mt-2 text-sm leading-6 text-slate-300">Record days with detail, media, and personal context.</p>
            </div>
            <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-5 transition duration-300">
              <p class="text-sm text-slate-400">02</p>
              <p class="mt-2 text-lg font-semibold text-white">Supplement</p>
              <p class="mt-2 text-sm leading-6 text-slate-300">Pull in useful trackables from connected apps so each day carries more real context.</p>
            </div>
            <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-5 transition duration-300">
              <p class="text-sm text-slate-400">03</p>
              <p class="mt-2 text-lg font-semibold text-white">Recognize patterns</p>
              <p class="mt-2 text-sm leading-6 text-slate-300">Notice recurring signals across mood, effort, habits, health, work, and play.</p>
            </div>
            <div class="glass-focus glass-focus-nested rounded-3xl border border-white/10 bg-slate-950/35 p-5 transition duration-300">
              <p class="text-sm text-slate-400">04</p>
              <p class="mt-2 text-lg font-semibold text-white">Reflect</p>
              <p class="mt-2 text-sm leading-6 text-slate-300">Use your own history to make better sense of the present.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-24 pb-10">
        <div class="glass-focus rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-[0_30px_120px_rgba(14,165,233,0.08)] backdrop-blur-2xl transition duration-300 lg:p-12">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Start building your archive</p>
          <h2 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Give your past more structure, and your future more context.
          </h2>
          <p class="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Capture your days, preserve what matters, and let reflection become something deeper than scrolling back through disconnected memories.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <RouterLink
              :to="primaryCtaTarget"
              class="rounded-full border border-cyan-300/40 bg-cyan-400/90 px-6 py-3 text-base font-semibold text-slate-950 shadow-[0_14px_40px_rgba(34,211,238,0.26)] transition hover:bg-cyan-300"
            >
              {{ primaryCtaLabel }}
            </RouterLink>
            <RouterLink
              to="/login/welcome"
              class="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white backdrop-blur-md transition hover:border-white/30 hover:bg-white/10"
            >
              Continue
            </RouterLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.glass-focus {
  box-shadow: 0 18px 60px rgba(2, 6, 23, 0.18);
  transition:
    background-color 300ms ease,
    border-color 300ms ease,
    box-shadow 300ms ease,
    transform 300ms ease,
    backdrop-filter 300ms ease;
}

.glass-focus:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(24px);
  transform: translateY(-1px);
  box-shadow:
    0 20px 56px rgba(2, 6, 23, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.glass-focus-nested:hover {
  background-color: inherit;
  border-color: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(20px);
  transform: translateY(-1px);
  box-shadow:
    0 14px 34px rgba(2, 6, 23, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.hero-visual:hover {
  transform: translateY(-3px);
  box-shadow:
    0 36px 120px rgba(15, 23, 42, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.cta-button {
  border: 1px solid rgba(103, 232, 249, 0.38);
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.95) 0%, rgba(103, 232, 249, 0.92) 45%, rgba(34, 211, 238, 0.95) 100%);
  background-size: 200% 100%;
  box-shadow:
    0 14px 40px rgba(34, 211, 238, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  animation: cta-gradient 4.5s linear infinite;
}

.cta-button:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 18px 52px rgba(34, 211, 238, 0.34),
    0 0 24px rgba(34, 211, 238, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.cta-button__glow {
  position: absolute;
  inset: -35%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 58%);
  filter: blur(18px);
  opacity: 0.55;
  transition: opacity 300ms ease, transform 400ms ease;
}

.cta-button:hover .cta-button__glow {
  opacity: 0.85;
  transform: scale(1.06);
}

.cta-button__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 25%, rgba(255, 255, 255, 0.45) 48%, transparent 72%);
  transform: translateX(-140%);
  animation: cta-shine 3.8s ease-in-out infinite;
}

@keyframes cta-gradient {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@keyframes cta-shine {
  0%,
  55% {
    transform: translateX(-140%);
  }
  100% {
    transform: translateX(140%);
  }
}
</style>
