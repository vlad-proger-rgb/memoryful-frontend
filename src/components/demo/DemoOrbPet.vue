<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AiOrbButton from '@/components/ai/AiOrbButton.vue'

defineOptions({
  name: 'DemoOrbPet',
})

const props = withDefaults(
  defineProps<{
    personality?: boolean
    size?: number
    ringSpread?: number
    outerRingSpread?: number
    outerRingHeightSpread?: number
  }>(),
  {
    personality: false,
    size: 52,
    ringSpread: 1.28,
    outerRingSpread: 2.05,
    outerRingHeightSpread: 1.3,
  },
)

const TILT = 6
const LEAN = 0.16
const LOGO_FOLLOW = 3
const PLAY_TRAVEL = 130
const DRAG_LIMIT = 46
const HURT_AT = 26
const DRAG_SLOP = 6
const EDGE_MARGIN = 8
const BREAK_OUT_MS = 900
const LAG_LIMIT = 30
const DIZZY_AT = 5
const DIZZY_MS = 2600
const MAGNET_RADIUS = 170
const SNAP_RADIUS = 70
const STORAGE_KEY = 'memoryful:orbPet'

const COMPLAINTS = [
  'aaah!',
  'ow — quit it',
  'seriously?',
  'how long can you keep this up?',
  'stop doing that',
  'alright, you have my attention!',
  'nnngh — almost —',
]

const DIZZY_LINES = [
  "i'm starting to be dizzy",
  'whoa — slow down',
  'ok, that is quite enough spinning',
  'urgh… my rings',
]

const supportsHover = ref(false)
const playful = computed(() => props.personality && supportsHover.value)

const orbSlot = ref<HTMLElement | null>(null)
const nest = ref<HTMLElement | null>(null)

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const clampAim = (value: number) => clamp(value, -1, 1)

const aim = ref({ x: 0, y: 0 })
const travel = ref(0)
const isHovering = ref(false)
const isPressed = ref(false)
const pull = ref({ x: 0, y: 0, distance: 0 })
const didDrag = ref(false)

const complaintIndex = ref(0)
const message = ref('')
const isFree = ref(false)
const isBreakingOut = ref(false)
const isHappy = ref(false)
const isDizzy = ref(false)
const freePos = ref({ x: 0, y: 0 })

const lag = ref({ x: 0, y: 0 })
const speed = ref(0)
const magnet = ref(0)

let dragOrigin: { x: number; y: number } | null = null
let freeOrigin: { x: number; y: number } | null = null
let lastPoint: { x: number; y: number } | null = null
let lastMoveAt = 0
let lastVelocity = { x: 0, y: 0 }
let dizziness = 0
let magnetArmed = false
let dizzyLine = 0
let messageTimer: ReturnType<typeof setTimeout> | null = null
let moodTimer: ReturnType<typeof setTimeout> | null = null
let breakTimer: ReturnType<typeof setTimeout> | null = null
let frame: number | null = null

const isHurt = computed(
  () => (pull.value.distance > HURT_AT && !isFree.value) || isBreakingOut.value,
)
const showEyes = computed(
  () =>
    playful.value &&
    ((isHovering.value && travel.value > PLAY_TRAVEL) ||
      isHurt.value ||
      isDizzy.value ||
      isHappy.value ||
      !!message.value),
)

const orbStyle = computed(() => {
  const { x: nx, y: ny } = aim.value
  const dragged = Math.min(pull.value.distance / DRAG_LIMIT, 1)
  const rush = Math.min(speed.value * 0.35, 0.55)

  const style: Record<string, string | number> = {
    '--tilt-x': `${nx * TILT + pull.value.x * 0.3 + lag.value.x}px`,
    '--tilt-y': `${ny * TILT + pull.value.y * 0.3 + lag.value.y}px`,
    '--ring-origin-x': `${50 - nx * 50}%`,
    '--ring-scale-x': 1 + Math.abs(nx) * LEAN + dragged * 0.4 + rush,
    '--logo-x': `${nx * LOGO_FOLLOW}px`,
    '--logo-y': `${ny * LOGO_FOLLOW}px`,
    '--logo-scale': 1 - Math.abs(nx) * 0.02 - Math.abs(ny) * 0.02,
    '--drag-x': `${isFree.value ? 0 : pull.value.x}px`,
    '--drag-y': `${isFree.value ? 0 : pull.value.y}px`,
    '--press-scale': isPressed.value ? 0.93 : 1,
    '--pupil-x': `${nx * 2.4}px`,
    '--pupil-y': `${ny * 2.4}px`,
  }

  if (isFree.value) {
    style.left = `${freePos.value.x}px`
    style.top = `${freePos.value.y}px`
  }

  return style
})

const say = (text: string, ms = 1400) => {
  message.value = text
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    message.value = ''
  }, ms)
}

const orbBox = () => orbSlot.value?.getBoundingClientRect() ?? null

const homeTarget = () => {
  const nestBox = nest.value?.getBoundingClientRect()
  const box = orbBox()
  if (!nestBox || !box || nestBox.width === 0) return null
  return {
    x: nestBox.left + nestBox.width / 2 - box.width / 2,
    y: nestBox.top + nestBox.height / 2 - box.height / 2,
    distance: Math.hypot(
      nestBox.left + nestBox.width / 2 - (box.left + box.width / 2),
      nestBox.top + nestBox.height / 2 - (box.top + box.height / 2),
    ),
  }
}

const clampToViewport = (x: number, y: number) => {
  const box = orbBox()
  const width = box?.width ?? 100
  const height = box?.height ?? 70
  return {
    x: clamp(x, EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN),
    y: clamp(y, EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN),
  }
}

const persist = () => {
  try {
    if (!isFree.value) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...freePos.value }))
  } catch {
    void 0
  }
}

const settleFrame = () => {
  lag.value = { x: lag.value.x * 0.86, y: lag.value.y * 0.86 }
  speed.value *= 0.9
  dizziness *= 0.985

  const home = homeTarget()
  if (home) {
    if (!magnetArmed && home.distance > MAGNET_RADIUS) magnetArmed = true
    const inRange = magnetArmed && home.distance < MAGNET_RADIUS
    magnet.value = inRange ? (1 - home.distance / MAGNET_RADIUS) ** 2 : 0

    if (inRange && !isPressed.value) {
      if (home.distance < SNAP_RADIUS) {
        comeHome('back in my spot')
      } else {
        const step = 0.035 + magnet.value * 0.18
        freePos.value = {
          x: freePos.value.x + (home.x - freePos.value.x) * step,
          y: freePos.value.y + (home.y - freePos.value.y) * step,
        }
      }
    }
  }

  if (dizziness > DIZZY_AT && !isDizzy.value) {
    isDizzy.value = true
    dizziness = 0
    say(DIZZY_LINES[dizzyLine % DIZZY_LINES.length], DIZZY_MS)
    dizzyLine += 1
    if (moodTimer) clearTimeout(moodTimer)
    moodTimer = setTimeout(() => {
      isDizzy.value = false
    }, DIZZY_MS)
  }

  frame = requestAnimationFrame(settleFrame)
}

const startFrames = () => {
  if (frame === null) frame = requestAnimationFrame(settleFrame)
}

const stopFrames = () => {
  if (frame !== null) cancelAnimationFrame(frame)
  frame = null
  lag.value = { x: 0, y: 0 }
  speed.value = 0
  dizziness = 0
}

const setFree = () => {
  const box = orbBox()
  if (box) freePos.value = clampToViewport(box.left, box.top)
  magnetArmed = false
  magnet.value = 0
  isFree.value = true
  persist()
  startFrames()
}

const breakOut = () => {
  isBreakingOut.value = true
  if (breakTimer) clearTimeout(breakTimer)
  breakTimer = setTimeout(() => {
    isBreakingOut.value = false
    setFree()
    say("finally I'm free!!", 2400)
    isHappy.value = true
    if (moodTimer) clearTimeout(moodTimer)
    moodTimer = setTimeout(() => {
      isHappy.value = false
    }, 2400)
  }, BREAK_OUT_MS)
}

const comeHome = (line = '…fine') => {
  isFree.value = false
  complaintIndex.value = 0
  magnet.value = 0
  magnetArmed = false
  stopFrames()
  persist()
  say(line, 900)
}

const trackPointer = (event: MouseEvent) => {
  const box = orbBox()
  if (!box) return

  aim.value = {
    x: clampAim((event.clientX - (box.left + box.width / 2)) / (box.width / 2)),
    y: clampAim((event.clientY - (box.top + box.height / 2)) / (box.height / 2)),
  }

  if (lastPoint) {
    travel.value += Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y)
  }
  lastPoint = { x: event.clientX, y: event.clientY }
}

const rubberBand = (delta: number) =>
  Math.sign(delta) * Math.min(DRAG_LIMIT, Math.abs(delta) * 0.45)

const readMotion = (event: PointerEvent) => {
  const now = performance.now()
  const elapsed = Math.max(8, now - lastMoveAt)
  lastMoveAt = now

  const vx = (event.clientX - (lastPoint?.x ?? event.clientX)) / elapsed
  const vy = (event.clientY - (lastPoint?.y ?? event.clientY)) / elapsed

  speed.value = speed.value * 0.5 + Math.hypot(vx, vy) * 0.5
  lag.value = {
    x: clamp(lag.value.x - vx * 26, -LAG_LIMIT, LAG_LIMIT),
    y: clamp(lag.value.y - vy * 26, -LAG_LIMIT, LAG_LIMIT),
  }

  // A reversal at speed is a shake; enough of them and the poor thing is dizzy.
  const flipped =
    Math.sign(vx) !== Math.sign(lastVelocity.x) || Math.sign(vy) !== Math.sign(lastVelocity.y)
  if (flipped && Math.hypot(vx, vy) > 0.7) dizziness += 1
  lastVelocity = { x: vx, y: vy }
}

const onEnter = () => {
  isHovering.value = true
}

const onLeave = () => {
  if (isPressed.value) return
  isHovering.value = false
  travel.value = 0
  lastPoint = null
  aim.value = { x: 0, y: 0 }
}

const onDragMove = (event: PointerEvent) => {
  if (!dragOrigin) return

  const dx = event.clientX - dragOrigin.x
  const dy = event.clientY - dragOrigin.y
  if (Math.hypot(dx, dy) > DRAG_SLOP) didDrag.value = true

  if (isFree.value && freeOrigin) {
    readMotion(event)

    let next = clampToViewport(freeOrigin.x + dx, freeOrigin.y + dy)
    const home = homeTarget()
    if (home && magnetArmed && home.distance < MAGNET_RADIUS) {
      const grip = (1 - home.distance / MAGNET_RADIUS) ** 2 * 0.55
      next = { x: next.x + (home.x - next.x) * grip, y: next.y + (home.y - next.y) * grip }
    }

    freePos.value = next
    trackPointer(event)
    return
  }

  const x = rubberBand(dx)
  const y = rubberBand(dy)
  pull.value = { x, y, distance: Math.hypot(x, y) }
  trackPointer(event)
}

const onDragEnd = () => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)

  if (isFree.value) {
    const home = homeTarget()
    if (home && magnetArmed && home.distance < SNAP_RADIUS) {
      comeHome('back in my spot')
    } else {
      if (didDrag.value) persist()
      if (speed.value > 1.4) say('oof', 1100)
    }
  } else if (pull.value.distance > HURT_AT) {
    const isLast = complaintIndex.value >= COMPLAINTS.length - 1
    say(COMPLAINTS[complaintIndex.value], isLast ? BREAK_OUT_MS : 1400)
    if (isLast) breakOut()
    else complaintIndex.value += 1
  }

  dragOrigin = null
  freeOrigin = null
  isPressed.value = false
  pull.value = { x: 0, y: 0, distance: 0 }
}

const onPointerDown = (event: PointerEvent) => {
  if (!playful.value || isBreakingOut.value || event.button !== 0) return

  isPressed.value = true
  didDrag.value = false
  dragOrigin = { x: event.clientX, y: event.clientY }
  freeOrigin = isFree.value ? { ...freePos.value } : null
  lastMoveAt = performance.now()
  lastVelocity = { x: 0, y: 0 }

  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
}

const swallowDragClick = (event: MouseEvent) => {
  if (!didDrag.value) return
  event.stopPropagation()
  event.preventDefault()
  didDrag.value = false
}

const keepInsideViewport = () => {
  if (!isFree.value) return
  freePos.value = clampToViewport(freePos.value.x, freePos.value.y)
}

onMounted(() => {
  supportsHover.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && props.personality) {
      const parsed = JSON.parse(raw) as { x?: number; y?: number }
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        isFree.value = true
        freePos.value = clampToViewport(parsed.x, parsed.y)
        complaintIndex.value = COMPLAINTS.length - 1
        startFrames()
      }
    }
  } catch {
    void 0
  }

  window.addEventListener('resize', keepInsideViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('resize', keepInsideViewport)
  if (messageTimer) clearTimeout(messageTimer)
  if (moodTimer) clearTimeout(moodTimer)
  if (breakTimer) clearTimeout(breakTimer)
  stopFrames()
})
</script>

<template>
  <div ref="nest" class="orb-nest" :style="{ '--magnet': magnet }">
    <button
      v-if="isFree"
      type="button"
      class="nest-recall"
      aria-label="Bring MemoryfulAI back to the bar"
      @click="comeHome()"
    >
      <span class="nest-ring" />
    </button>

    <Teleport to="body" :disabled="!isFree">
      <div
        ref="orbSlot"
        class="orb-slot"
        :class="{
          'is-playful': playful,
          'is-dragging': isPressed,
          'is-hurt': isHurt,
          'is-free': isFree,
          'is-breaking': isBreakingOut,
          'is-dizzy': isDizzy,
          'is-happy': isHappy,
        }"
        :style="orbStyle"
        @mouseenter="onEnter"
        @mousemove="trackPointer"
        @mouseleave="onLeave"
        @pointerdown="onPointerDown"
        @click.capture="swallowDragClick"
        @dragstart.prevent
      >
        <AiOrbButton
          :size="size"
          :ring-spread="ringSpread"
          :outer-ring-spread="outerRingSpread"
          :outer-ring-height-spread="outerRingHeightSpread"
        />

        <span class="orb-eyes" :class="{ 'is-visible': showEyes }" aria-hidden="true">
          <span class="eye"><span class="pupil" /></span>
          <span class="eye"><span class="pupil" /></span>
        </span>

        <Transition name="yelp">
          <span v-if="message" class="orb-yelp" aria-hidden="true">{{ message }}</span>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.orb-nest {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 78px;
  line-height: 0;
}

.nest-recall {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  cursor: pointer;
}

.nest-ring {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px dashed rgba(255, 255, 255, calc(0.35 + var(--magnet, 0) * 0.55));
  box-shadow: 0 0 calc(var(--magnet, 0) * 18px) rgba(196, 162, 255, calc(var(--magnet, 0) * 0.9));
  transform: scale(calc(1 + var(--magnet, 0) * 0.18));
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nest-recall:hover .nest-ring {
  border-color: rgba(255, 255, 255, 0.7);
  transform: scale(1.08);
}

.orb-slot {
  position: relative;
  display: grid;
  place-items: center;
  line-height: 0;
}

.orb-slot.is-playful {
  user-select: none;
  touch-action: none;
}

.orb-slot.is-free {
  position: fixed;
  z-index: 60;
  cursor: grab;
}

.orb-slot.is-free.is-dragging {
  cursor: grabbing;
}

.orb-slot :deep(.orbit-rings) {
  transform-origin: var(--ring-origin-x, 50%) center;
  transform: translate(calc(-50% + var(--tilt-x)), calc(-50% + var(--tilt-y)))
    scaleX(var(--ring-scale-x, 1));
  transition:
    transform 0.25s ease-out,
    opacity 0.4s ease;
}

.orb-slot.is-free :deep(.orbit-rings) {
  transition:
    transform 0.12s ease-out,
    opacity 0.4s ease;
}

.orb-slot :deep(.orbit-rings-outer) {
  transform: translate(calc(-50% + var(--tilt-x) * 1.6), calc(-50% + var(--tilt-y) * 1.6))
    scaleX(calc(var(--ring-scale-x, 1) * 1.05));
}

.orb-slot :deep(.ai-logo-orbit:hover .orbit-rings) {
  transform: translate(calc(-50% + var(--tilt-x)), calc(-50% + var(--tilt-y)))
    scaleX(calc(var(--ring-scale-x, 1) * 1.2));
}

.orb-slot :deep(.ai-logo-orbit:hover .orbit-rings-outer) {
  transform: translate(calc(-50% + var(--tilt-x) * 1.6), calc(-50% + var(--tilt-y) * 1.6))
    scaleX(calc(var(--ring-scale-x, 1) * 1.12));
}

.orb-slot.is-playful :deep(.ai-logo-orbit) {
  transform: translate(var(--drag-x, 0), var(--drag-y, 0)) scale(var(--press-scale, 1));
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.orb-slot.is-playful.is-dragging :deep(.ai-logo-orbit) {
  transition: transform 0.06s linear;
}

.orb-slot.is-playful :deep(.orbit-logo) {
  animation: orb-breathe 5.5s ease-in-out infinite;
  transition: transform 0.25s ease-out;
}

.orb-slot.is-playful:hover :deep(.orbit-logo) {
  animation: none;
  transform: translate(var(--logo-x, 0), var(--logo-y, 0)) scale(var(--logo-scale, 1));
}

@keyframes orb-breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.035);
  }
}

.orb-slot.is-breaking :deep(.ai-logo-orbit) {
  animation: orb-strain 900ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.orb-slot.is-breaking :deep(.orbit-logo) {
  animation: none;
}

.orb-slot.is-breaking :deep(.orbit-rings) {
  animation: ring-snap 900ms ease-out;
}

@keyframes orb-strain {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  8%,
  24%,
  40%,
  56% {
    transform: translate(-4px, 1px) scale(0.94);
  }
  16%,
  32%,
  48%,
  64% {
    transform: translate(4px, -1px) scale(0.94);
  }
  74% {
    transform: translate(0, 2px) scale(0.82);
  }
  88% {
    transform: translate(0, -6px) scale(1.22);
  }
}

@keyframes ring-snap {
  0% {
    transform: translate(-50%, -50%) scaleX(1);
    opacity: 0.85;
  }
  74% {
    transform: translate(-50%, -50%) scale(0.72);
    opacity: 1;
  }
  88% {
    transform: translate(-50%, -50%) scale(1.75);
    opacity: 0.25;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.85;
  }
}

.orb-eyes {
  position: absolute;
  z-index: 3;
  display: flex;
  gap: 9px;
  pointer-events: none;
  opacity: 0;
  transform: translate(var(--drag-x, 0), var(--drag-y, 0)) scale(var(--press-scale, 1));
  transition:
    opacity 0.3s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.orb-slot.is-dragging .orb-eyes {
  transition:
    opacity 0.3s ease,
    transform 0.06s linear;
}

.orb-eyes.is-visible {
  opacity: 1;
}

.eye {
  width: 11px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(247, 242, 255, 0.95),
    rgba(214, 203, 235, 0.9)
  );
  display: grid;
  place-items: center;
  box-shadow: inset 0 -1px 2px rgba(90, 74, 130, 0.35);
  transition:
    height 0.15s ease,
    border-radius 0.15s ease;
}

.pupil {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background: #4a3b6b;
  transform: translate(var(--pupil-x, 0), var(--pupil-y, 0));
  transition: transform 0.1s ease-out;
}

.orb-slot.is-hurt .eye {
  height: 3px;
  border-radius: 3px;
}

.orb-slot.is-hurt .pupil {
  opacity: 0;
}

/* Freshly out: eyes curve up. */
.orb-slot.is-happy .eye {
  height: 6px;
  border-radius: 8px 8px 2px 2px;
}

.orb-slot.is-happy .pupil {
  opacity: 0;
}

/* Swung around too hard: the pupils lose their footing. */
.orb-slot.is-dizzy .eye {
  height: 13px;
  width: 13px;
}

.orb-slot.is-dizzy .pupil {
  animation: pupil-swirl 620ms linear infinite;
  transition: none;
}

@keyframes pupil-swirl {
  0% {
    transform: translate(2.6px, 0);
  }
  25% {
    transform: translate(0, 2.6px);
  }
  50% {
    transform: translate(-2.6px, 0);
  }
  75% {
    transform: translate(0, -2.6px);
  }
  100% {
    transform: translate(2.6px, 0);
  }
}

.orb-yelp {
  position: absolute;
  top: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.6875rem;
  line-height: 1.4;
  white-space: nowrap;
  color: #fff;
  background: rgba(122, 90, 168, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
}

.orb-slot.is-happy .orb-yelp {
  background: rgba(96, 132, 190, 0.92);
}

.yelp-enter-active,
.yelp-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.yelp-enter-from,
.yelp-leave-to {
  opacity: 0;
  transform: translate(-50%, -4px);
}

@media (prefers-reduced-motion: reduce) {
  .orb-slot :deep(.orbit-rings),
  .orb-slot.is-playful :deep(.ai-logo-orbit),
  .orb-eyes {
    transition: none;
  }

  .orb-slot.is-playful :deep(.orbit-logo),
  .orb-slot.is-breaking :deep(.ai-logo-orbit),
  .orb-slot.is-breaking :deep(.orbit-rings),
  .orb-slot.is-dizzy .pupil {
    animation: none;
  }
}
</style>
