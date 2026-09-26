export interface FeatureFlag {
  id: FeatureFlagId
  label: string
  description: string
  default: boolean
}

export type FeatureFlagId = 'orbPet' | 'navIconColors'

export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'navIconColors',
    label: 'Tinted nav icons',
    description:
      'Give each destination in the bottom bar its own color instead of rendering every icon flat white.',
    default: false,
  },
  {
    id: 'orbPet',
    label: 'Living AI orb',
    description:
      'The MemoryfulAI orb in the header watches the cursor, opens its eyes when you play with it, and can be dragged out of the bar to sit anywhere on the page. Desktop only.',
    default: false,
  },
]

export const FEATURE_FLAG_STORAGE_KEY = 'memoryful:flags'
