export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface Island {
  id: string
  name: string
  description: string
  color: string
  icon: string
  unlocked: boolean
  progress: number // 0-100
}

export interface UserProfile extends User {
  islands: Island[]
  socialLinks: SocialLink[]
  stats: UserStats
}

export interface SocialLink {
  platform: 'github' | 'twitter' | 'linkedin' | 'website' | 'instagram'
  url: string
}

export interface UserStats {
  totalPractices: number
  completedPractices: number
  totalCheckIns: number
  currentStreak: number
  longestStreak: number
  joinedDays: number
}
