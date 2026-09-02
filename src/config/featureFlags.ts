export interface FeatureFlag {
  id: FeatureFlagId
  label: string
  description: string
  default: boolean
}

export type FeatureFlagId = 'demoUi'

export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'demoUi',
    label: 'Demo UI',
    description:
      'The merged dashboard: today, search and the calendar in one page, with a simpler header. Layout only — your days and every request stay the same.',
    default: false,
  },
]

export const FEATURE_FLAG_STORAGE_KEY = 'memoryful:flags'
