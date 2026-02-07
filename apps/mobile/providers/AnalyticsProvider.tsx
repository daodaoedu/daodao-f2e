import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import { usePathname } from 'expo-router'
import { PostHogProvider } from 'posthog-react-native'
import type PostHog from 'posthog-react-native'
import {
  analyticsService,
  type AnalyticsUser,
  type CheckInEventProperties,
  type PracticeCreatedEventProperties,
  type LoginEventProperties,
  type ShareCheckInEventProperties,
} from '@/services/analytics'

interface AnalyticsContextValue {
  identify: (user: AnalyticsUser) => void
  reset: () => void
  trackScreenView: (screenName: string) => void
  trackCheckIn: (properties: CheckInEventProperties) => void
  trackPracticeCreated: (properties: PracticeCreatedEventProperties) => void
  trackLogin: (properties: LoginEventProperties) => void
  trackShareCheckIn: (properties: ShareCheckInEventProperties) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

interface AnalyticsProviderProps {
  children: ReactNode
}

function AnalyticsProviderContent({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  // Track screen views
  useEffect(() => {
    if (pathname) {
      analyticsService.trackScreenView(pathname)
    }
  }, [pathname])

  // Memoize context value to prevent unnecessary re-renders
  const value: AnalyticsContextValue = useMemo(
    () => ({
      identify: (user) => analyticsService.identify(user),
      reset: () => analyticsService.reset(),
      trackScreenView: (screenName) => analyticsService.trackScreenView(screenName),
      trackCheckIn: (properties) => analyticsService.trackCheckIn(properties),
      trackPracticeCreated: (properties) => analyticsService.trackPracticeCreated(properties),
      trackLogin: (properties) => analyticsService.trackLogin(properties),
      trackShareCheckIn: (properties) => analyticsService.trackShareCheckIn(properties),
    }),
    []
  )

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [posthogClient, setPosthogClient] = useState<PostHog | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize analytics and get PostHog client
  useEffect(() => {
    async function init() {
      await analyticsService.initialize()
      setPosthogClient(analyticsService.getClient())
      setIsInitialized(true)
    }
    init()
  }, [])

  // Don't render until initialized to avoid flash
  if (!isInitialized) {
    return null
  }

  const content = <AnalyticsProviderContent>{children}</AnalyticsProviderContent>

  // If PostHog client is available, wrap with PostHogProvider for additional features
  if (posthogClient) {
    return (
      <PostHogProvider client={posthogClient}>
        {content}
      </PostHogProvider>
    )
  }

  return content
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}
