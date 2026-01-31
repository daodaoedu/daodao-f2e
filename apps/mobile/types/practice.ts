export type PracticeStatus = 'active' | 'completed' | 'archived'
export type PracticeFrequency = 'daily' | 'weekly' | 'custom'

export interface Practice {
  id: string
  title: string
  description?: string
  frequency: PracticeFrequency
  targetDays: number
  completedDays: number
  currentStreak: number
  longestStreak: number
  status: PracticeStatus
  tags: string[]
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
  lastCheckInAt?: string
  todayCheckedIn: boolean
}

export interface CheckIn {
  id: string
  practiceId: string
  note?: string
  createdAt: string
}

export interface PracticeStats {
  totalPractices: number
  activePractices: number
  completedToday: number
  totalToday: number
  currentStreak: number
  totalCheckIns: number
}

export interface PracticesResponse {
  practices: Practice[]
  stats: PracticeStats
}
