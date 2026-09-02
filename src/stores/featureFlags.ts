import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { FEATURE_FLAGS, FEATURE_FLAG_STORAGE_KEY, type FeatureFlagId } from '@/config/featureFlags'

type FlagState = Record<FeatureFlagId, boolean>

const defaults = (): FlagState =>
  Object.fromEntries(FEATURE_FLAGS.map((flag) => [flag.id, flag.default])) as FlagState

export const useFeatureFlagsStore = defineStore('featureFlags', () => {
  const flags = ref<FlagState>(defaults())

  const persist = () => {
    try {
      localStorage.setItem(FEATURE_FLAG_STORAGE_KEY, JSON.stringify(flags.value))
    } catch {}
  }

  const readStored = () => {
    try {
      const raw = localStorage.getItem(FEATURE_FLAG_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>
      for (const flag of FEATURE_FLAGS) {
        const value = parsed[flag.id]
        if (typeof value === 'boolean') flags.value[flag.id] = value
      }
    } catch {}
  }

  const readUrl = () => {
    const params = new URLSearchParams(window.location.search)
    let touched = false

    for (const flag of FEATURE_FLAGS) {
      const value = params.get(flag.id)
      if (value === null) continue
      flags.value[flag.id] = value !== '0' && value !== 'false'
      touched = true
    }

    if (touched) persist()
  }

  const hydrate = () => {
    readStored()
    readUrl()
  }

  const isEnabled = (id: FeatureFlagId) => flags.value[id]

  const setFlag = (id: FeatureFlagId, value: boolean) => {
    flags.value[id] = value
    persist()
  }

  const demoUi = computed(() => flags.value.demoUi)

  return { flags, demoUi, hydrate, isEnabled, setFlag }
})

export default useFeatureFlagsStore
