import { useMemo } from 'react'
import useSWR from 'swr'
import { api } from '@/services/api-client'
import { useAuth } from '@/providers/AuthProvider'
import type { UserProfile } from '@/types/user'

const DEFAULT_STATS = {
  totalPractices: 0,
  completedPractices: 0,
  totalCheckIns: 0,
  currentStreak: 0,
  longestStreak: 0,
  joinedDays: 0,
} as const

export function useCurrentUser() {
  const { user: authUser, isAuthenticated } = useAuth()

  const fallbackData = useMemo<UserProfile | undefined>(() => {
    if (!authUser) return undefined
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      avatar: authUser.avatar,
      createdAt: '',
      updatedAt: '',
      islands: [],
      socialLinks: [],
      stats: DEFAULT_STATS,
    }
  }, [authUser])

  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    isAuthenticated ? '/users/me' : null,
    () => api.get<UserProfile>('/users/me'),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      fallbackData,
    }
  )

  return {
    user: data,
    isLoading,
    error,
    mutate,
  }
}
