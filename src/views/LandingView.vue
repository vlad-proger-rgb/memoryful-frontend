<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingParticleOrb from '@/components/LandingParticleOrb.vue'
import logo from '@/assets/img/memoryful-ai-brain.png'
import { getIcon } from '@/plugins/fontawesome'
import type { FAIcon } from '@/types/fontawesome'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const primaryCtaTarget = computed(() => userStore.isAuthenticated ? '/dashboard' : '/login/welcome')
const primaryCtaLabel = computed(() => userStore.isAuthenticated ? 'Open app' : 'Get started')
const usePlatformSocialColors = true

const socialLinks: Array<{ label: string; href: string; icon: FAIcon }> = [
  {
    label: 'GitHub',
    href: 'https://github.com/vlad-proger-rgb',
    icon: { name: 'github', style: 'fab' },
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/vladyslav-buchenko/',
    icon: { name: 'linkedin-in', style: 'fab' },
  },
  {
    label: 'Reddit',
    href: 'https://www.reddit.com/user/ooo-InstaGamer/',
    icon: { name: 'reddit-alien', style: 'fab' },
  },
  {
    label: 'Telegram',
    href: 'https://t.me/PyVladislav',
    icon: { name: 'telegram', style: 'fab' },
  },
]

const defaultSocialGlowPalette = ['#8b5cf6', '#60a5fa', '#d946ef', '#22c55e'] as const
const platformSocialGlowMap: Record<string, string> = {
  GitHub: '#ffffff',
  LinkedIn: '#0a66c2',
  Reddit: '#ff4500',
  Telegram: '#24a1de',
}

const socialLinkStyles = computed(() => {
  return socialLinks.map((social, index) => ({
    '--glow': usePlatformSocialColors
      ? (platformSocialGlowMap[social.label] ?? defaultSocialGlowPalette[index] ?? defaultSocialGlowPalette[0])
      : (defaultSocialGlowPalette[index] ?? defaultSocialGlowPalette[0]),
    '--icon-color': usePlatformSocialColors
      ? (platformSocialGlowMap[social.label] ?? '#ffffff')
      : '#ffffff',
  }))
})

const repoLinks = [
  { label: 'Backend', href: 'https://github.com/vlad-proger-rgb/memoryful-backend' },
  { label: 'Frontend', href: 'https://github.com/vlad-proger-rgb/memoryful-frontend' },
  { label: 'Design', href: 'https://www.figma.com/design/xzNmSkhKBA0i5qGtOmIic3/Memoryful?m=auto&t=1hR07gYYiYbYjpqq-1' },
]
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
        <div class="max-w-2xl lg:max-w-[42rem]">
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

          <div class="mt-10 flex w-full justify-center">
            <RouterLink
              :to="primaryCtaTarget"
              class="cta-button group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-base font-semibold text-slate-950 transition duration-500"
            >
              <span class="cta-button__glow"></span>
              <span class="cta-button__shine"></span>
              <span class="relative z-10">{{ primaryCtaLabel }}</span>
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
          <!-- Inspired by: https://codepen.io/giana/pen/LYaOdye -->
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
          </div>
        </div>
      </section>

      <section class="pb-16 pt-6">
        <div class="footer-shell grid gap-5 rounded-[2.5rem] border border-white/10 bg-white/10 p-5 shadow-[0_34px_120px_rgba(2,6,23,0.32)] backdrop-blur-2xl lg:grid-cols-[0.94fr_1.12fr_0.94fr] lg:items-stretch lg:gap-5 lg:rounded-[3.5rem] lg:p-6">
          <div class="flex h-full flex-col gap-4">
            <!-- Social glow styling inspired by: https://codepen.io/Krishnaa_Gupta/pen/MWoRqmr -->
            <div class="footer-social-strip flex flex-wrap items-center justify-center gap-3 rounded-[1.35rem] border border-emerald-400/20 bg-slate-950/55 px-4 py-3">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.href"
                :style="socialLinkStyles[socialLinks.indexOf(social)]"
                :aria-label="social.label"
                target="_blank"
                rel="noreferrer"
                class="footer-social-link"
              >
                <font-awesome-icon :icon="getIcon(social.icon)" class="footer-social-icon text-[1.15rem]" />
              </a>
            </div>

            <div class="glass-focus-nested footer-card flex-1 rounded-[1.65rem] border border-white/10 bg-slate-950/50 p-6 transition duration-300">
              <div class="flex h-full flex-col items-center justify-center gap-5 text-center">
                <div class="footer-icon-panel flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/10 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <font-awesome-icon :icon="['far', 'address-book']" class="text-5xl" />
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-300">3+ years of experience</p>
                  <a href="https://drive.google.com/file/d/17izuvJtdP-kmR5aMpFo6zHpT-o4ntJU6/view?usp=sharing" target="_blank" rel="noreferrer" class="footer-chip-link inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg text-slate-200">
                    <span>Resume</span>
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-base" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-focus-nested footer-card flex min-h-[18rem] flex-col justify-between rounded-[1.8rem] border border-white/10 bg-slate-950/45 p-6 transition duration-300 lg:min-h-[20rem] lg:px-7">
            <div class="mx-auto max-w-[28rem] text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Memoryful network</p>
              <h3 class="mt-4 text-2xl font-semibold text-white sm:text-3xl">One memory system, enriched by the rest of your life.</h3>
              <p class="mt-4 max-w-xl leading-7 text-slate-300">
                Day entries stay central, while connected tools can supplement them with useful signals from health, coding, gaming, and beyond.
              </p>
            </div>

            <div class="footer-center-panel mt-6 rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_78%_32%,rgba(34,197,94,0.14),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.82))] p-5">
              <div class="grid gap-3 text-center sm:grid-cols-3">
                <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition duration-300">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Daily</p>
                  <p class="mt-2 text-sm font-medium text-white">Record</p>
                </div>
                <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition duration-300">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Patterns</p>
                  <p class="mt-2 text-sm font-medium text-white">Analyze</p>
                </div>
                <div class="glass-focus glass-focus-nested rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 transition duration-300">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Outcome</p>
                  <p class="mt-2 text-sm font-medium text-white">Improve</p>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-focus-nested footer-card flex h-full flex-col items-center justify-center rounded-[1.65rem] border border-white/10 bg-slate-950/50 p-6 text-center transition duration-300">
            <div class="footer-repo-icon flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <font-awesome-icon :icon="getIcon({ name: 'github', style: 'fab' })" class="text-6xl" />
            </div>

            <div class="mt-6 flex w-full flex-col items-center gap-3">
              <a
                v-for="repo in repoLinks"
                :key="repo.label"
                :href="repo.href"
                target="_blank"
                rel="noreferrer"
                class="footer-repo-link flex w-full max-w-[14rem] items-center justify-center rounded-full px-5 py-2.5 text-base text-slate-200"
              >
                {{ repo.label }}
                <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="ml-2 text-sm opacity-70" />
              </a>
            </div>
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

.footer-shell {
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.08), transparent 22%),
    radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.05), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
}

.footer-card {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 24px 80px rgba(2, 6, 23, 0.22);
}

.footer-social-strip {
  background: rgba(2, 6, 23, 0.42);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 12px 30px rgba(2, 6, 23, 0.18);
}

.footer-social-link {
  --glow: #0072ff;
  --icon-color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 0.95rem;
  color: #ffffff;
  background-color: #18191f;
  box-shadow:
    2px 2px 2px rgba(0, 0, 0, 0.5),
    10px 1px 12px rgba(0, 0, 0, 0.5),
    2px 2px 10px rgba(0, 0, 0, 0.5),
    2px 2px 3px rgba(0, 0, 0, 0.5),
    inset 2px 2px 10px rgba(0, 0, 0, 0.5),
    inset 2px 2px 10px rgba(0, 0, 0, 0.5),
    inset 2px 2px 10px rgba(0, 0, 0, 0.5),
    inset 2px 2px 10px rgba(0, 0, 0, 0.5),
    0 0 16px color-mix(in srgb, var(--glow) 55%, transparent),
    0 0 34px color-mix(in srgb, var(--glow) 38%, transparent);
  text-shadow:
    0 0 22px var(--glow),
    0 0 44px var(--glow),
    0 0 72px var(--glow),
    0 0 96px var(--glow);
  transition:
    transform 260ms ease,
    box-shadow 260ms ease,
    color 260ms ease,
    filter 260ms ease;
  animation: footer-icon-glow 3s linear infinite;
}

.footer-social-icon {
  color: var(--icon-color);
}

.footer-social-link:nth-child(2) {
  animation-delay: 0.7s;
}

.footer-social-link:nth-child(3) {
  animation-delay: 0.1s;
}

.footer-social-link:nth-child(4) {
  animation-delay: 1s;
}

.footer-social-link:nth-child(1) {
  animation-delay: 0.3s;
}

.footer-social-link:hover {
  transform: translateY(-2px) scale(1.03);
  filter: brightness(1.08);
  box-shadow:
    2px 2px 2px rgba(0, 0, 0, 0.5),
    10px 1px 12px rgba(0, 0, 0, 0.5),
    2px 2px 10px rgba(0, 0, 0, 0.5),
    2px 2px 3px rgba(0, 0, 0, 0.5),
    inset 2px 2px 10px rgba(0, 0, 0, 0.5),
    inset 2px 2px 10px rgba(0, 0, 0, 0.5),
    0 0 22px color-mix(in srgb, var(--glow) 68%, transparent),
    0 0 44px color-mix(in srgb, var(--glow) 46%, transparent);
}

.footer-social-link:focus-visible,
.footer-chip-link:focus-visible,
.footer-repo-link:focus-visible {
  outline: 2px solid rgba(103, 232, 249, 0.9);
  outline-offset: 3px;
}

.footer-chip-link,
.footer-repo-link {
  border: 1.5px solid rgba(34, 197, 94, 0.82);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.56), rgba(15, 23, 42, 0.38));
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 0 18px rgba(34, 197, 94, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    transform 240ms ease,
    border-color 240ms ease,
    box-shadow 240ms ease,
    background-color 240ms ease;
}

.footer-chip-link:hover,
.footer-repo-link:hover {
  transform: translateY(-1px);
  border-color: rgba(74, 222, 128, 0.98);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.66), rgba(15, 23, 42, 0.46));
  box-shadow:
    0 0 18px rgba(255, 255, 255, 0.08),
    0 0 28px rgba(34, 197, 94, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.footer-center-panel,
.footer-icon-panel,
.footer-repo-icon {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 20px 60px rgba(2, 6, 23, 0.18);
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

@keyframes footer-icon-glow {
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(360deg);
  }
}
</style>
