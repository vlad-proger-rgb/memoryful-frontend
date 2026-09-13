import type { ChatModelRef } from './chat'

export const ANALYSIS_PURPOSES = ['day', 'week'] as const

export type AnalysisPurpose = (typeof ANALYSIS_PURPOSES)[number]

export interface PurposeModel {
  model: ChatModelRef
  isDefault: boolean
}

export type AiModelPreferences = Record<AnalysisPurpose, PurposeModel>
