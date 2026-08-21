<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { loadGoogleIdentity } from '@/composables'
import type { GoogleCredentialResponse } from '@/composables'

const emit = defineEmits<{
  (e: 'credential', credential: string): void
}>()

const container = ref<HTMLDivElement | null>(null)
const unavailable = ref(false)

let observer: ResizeObserver | null = null
let renderedWidth = 0

const handleCredential = (response: GoogleCredentialResponse) => {
  if (response?.credential) emit('credential', response.credential)
}

// Google draws the button into an iframe, so its width is a pixel number we recompute
// rather than a class; re-rendering only on a real change also stops the observer looping.
const render = () => {
  const el = container.value
  const api = window.google?.accounts?.id
  if (!el || !api) return

  const width = Math.min(Math.round(el.clientWidth), 400)
  if (width <= 0 || width === renderedWidth) return

  renderedWidth = width
  el.replaceChildren()
  api.renderButton(el, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'center',
    width,
  })
}

onMounted(async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    unavailable.value = true
    return
  }

  try {
    const gsi = await loadGoogleIdentity()
    gsi.initialize({
      client_id: clientId,
      callback: handleCredential,
      ux_mode: 'popup',
    })
    render()

    observer = new ResizeObserver(render)
    if (container.value) observer.observe(container.value)
  } catch (error) {
    console.error('Google Identity Services unavailable:', error)
    unavailable.value = true
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="w-full flex flex-col items-center gap-2">
    <!-- Google's markup only offers 4 corner presets, so the squircle is a clip on our
         side; the container has to hug the button exactly or it clips empty space. -->
    <div ref="container" class="w-full min-h-[40px] overflow-hidden rounded-xl"></div>
    <p v-if="unavailable" class="text-white/60 text-xs text-center">
      Google sign-in is unavailable right now — use your email above.
    </p>
  </div>
</template>
