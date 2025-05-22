export interface LearningItemCreate {
  title: string
  description?: string
  icon?: string
}

export interface LearningItem extends LearningItemCreate {
  id: string
}

export interface LearningProgress {
  learningItem: LearningItem
  timeInvolved: number
}
