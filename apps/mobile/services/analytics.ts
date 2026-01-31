/**
 * Multi-platform Analytics Service
 *
 * Integrates three analytics platforms:
 * 1. PostHog - Product analytics and feature flags
 * 2. Google Analytics 4 (Firebase) - Standard web/mobile analytics
 * 3. Microsoft Clarity - Session replay and heatmaps
 *
 * Configuration:
 * - PostHog: Set EXPO_PUBLIC_POSTHOG_KEY and optionally EXPO_PUBLIC_POSTHOG_HOST
 * - Firebase: Configure via google-services.json (Android) / GoogleService-Info.plist (iOS)
 * - Clarity: Set EXPO_PUBLIC_CLARITY_PROJECT_ID
 * - Global toggle: Set EXPO_PUBLIC_ENABLE_ANALYTICS=false to disable all tracking
 *
 * Platform support:
 * - PostHog: iOS, Android, Web
 * - Firebase Analytics: iOS, Android only (requires native configuration)
 * - Clarity: iOS, Android only
 *
 * @see https://posthog.com/docs/libraries/react-native
 * @see https://rnfirebase.io/analytics/usage
 * @see https://learn.microsoft.com/en-us/clarity/mobile-sdk/react-native-sdk
 */
import PostHog from 'posthog-react-native'
import analytics, { type FirebaseAnalyticsTypes } from '@react-native-firebase/analytics'
import * as Clarity from '@microsoft/react-native-clarity'

// PostHog Configuration
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

// Microsoft Clarity Configuration
const CLARITY_PROJECT_ID = process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID || ''

// Global enable/disable
const ENABLE_ANALYTICS = process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'false'

// Firebase Analytics limits
const FIREBASE_MAX_PARAMS = 25
const FIREBASE_MAX_KEY_LENGTH = 40
const FIREBASE_MAX_VALUE_LENGTH = 100

let posthogClient: PostHog | null = null

export interface AnalyticsUser {
  id: string
  email?: string
  name?: string
}

type AnalyticsProperties = Record<string, string | number | boolean | undefined>

export interface CheckInEventProperties {
  practice_id: string
  streak_count: number
  has_note: boolean
}

export interface PracticeCreatedEventProperties {
  practice_id: string
  template_id?: string
}

export interface ShareCheckInEventProperties {
  practice_id: string
}

export interface LoginEventProperties {
  method: 'google' | 'apple' | 'email'
}

export type AnalyticsEventName =
  | 'screen_view'
  | 'check_in'
  | 'practice_created'
  | 'login'
  | 'share_check_in'

export type AnalyticsEventProperties =
  | { screen_name: string }
  | CheckInEventProperties
  | PracticeCreatedEventProperties
  | LoginEventProperties
  | ShareCheckInEventProperties

class AnalyticsService {
  private initialized = false
  private clarityInitialized = false
  private firebaseInitialized = false

  async initialize(): Promise<void> {
    if (this.initialized || !ENABLE_ANALYTICS) {
      return
    }

    // Initialize PostHog
    if (POSTHOG_KEY) {
      try {
        posthogClient = new PostHog(POSTHOG_KEY, {
          host: POSTHOG_HOST,
          enableSessionReplay: false,
        })

        if (__DEV__) {
          console.log('[Analytics] PostHog initialized')
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[Analytics] PostHog failed to initialize:', error)
        }
      }
    } else if (__DEV__) {
      console.log('[Analytics] PostHog key not configured, skipping')
    }

    // Initialize Microsoft Clarity
    if (CLARITY_PROJECT_ID) {
      try {
        Clarity.initialize(CLARITY_PROJECT_ID)
        this.clarityInitialized = true

        if (__DEV__) {
          console.log('[Analytics] Clarity initialized')
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[Analytics] Clarity failed to initialize:', error)
        }
      }
    } else if (__DEV__) {
      console.log('[Analytics] Clarity project ID not configured, skipping')
    }

    // Initialize Firebase Analytics
    try {
      const firebaseAnalytics = analytics()
      if (firebaseAnalytics) {
        await firebaseAnalytics.setAnalyticsCollectionEnabled(true)
        this.firebaseInitialized = true

        if (__DEV__) {
          console.log('[Analytics] Firebase Analytics initialized')
        }
      } else if (__DEV__) {
        console.warn('[Analytics] Firebase Analytics not available')
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Firebase Analytics failed to initialize:', error)
      }
    }

    this.initialized = true

    if (__DEV__) {
      console.log('[Analytics] Initialization complete')
    }
  }

  /**
   * Safely get Firebase Analytics instance
   */
  private getFirebaseAnalytics(): FirebaseAnalyticsTypes.Module | null {
    if (!this.firebaseInitialized) return null

    try {
      return analytics()
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to get Firebase Analytics instance:', error)
      }
      return null
    }
  }

  /**
   * Sanitize properties for Firebase Analytics limits
   */
  private sanitizePropertiesForFirebase(
    properties?: AnalyticsProperties
  ): Record<string, string | number> {
    if (!properties) return {}

    const sanitized: Record<string, string | number> = {}
    const entries = Object.entries(properties).slice(0, FIREBASE_MAX_PARAMS)

    for (const [key, value] of entries) {
      if (value === undefined) continue

      // Truncate long keys
      const sanitizedKey = key.slice(0, FIREBASE_MAX_KEY_LENGTH)

      // Truncate long string values, convert boolean to number
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = value.slice(0, FIREBASE_MAX_VALUE_LENGTH)
      } else if (typeof value === 'boolean') {
        sanitized[sanitizedKey] = value ? 1 : 0
      } else {
        sanitized[sanitizedKey] = value
      }
    }

    return sanitized
  }

  identify(user: AnalyticsUser): void {
    if (!this.initialized) return

    try {
      // PostHog identify
      if (posthogClient) {
        const properties: Record<string, string> = {}
        if (user.email) properties.email = user.email
        if (user.name) properties.name = user.name
        posthogClient.identify(user.id, properties)
      }

      // Firebase Analytics set user ID
      const firebaseAnalytics = this.getFirebaseAnalytics()
      if (firebaseAnalytics) {
        firebaseAnalytics.setUserId(user.id)
        if (user.email) {
          firebaseAnalytics.setUserProperty('email', user.email)
        }
        if (user.name) {
          firebaseAnalytics.setUserProperty('name', user.name)
        }
      }

      // Clarity set custom user ID
      if (this.clarityInitialized) {
        Clarity.setCustomUserId(user.id)
      }

      if (__DEV__) {
        console.log('[Analytics] User identified:', user.id)
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to identify user:', error)
      }
    }
  }

  reset(): void {
    if (!this.initialized) return

    try {
      // PostHog reset
      if (posthogClient) {
        posthogClient.reset()
      }

      // Firebase Analytics reset user ID
      const firebaseAnalytics = this.getFirebaseAnalytics()
      if (firebaseAnalytics) {
        firebaseAnalytics.setUserId(null)
      }

      // Clarity doesn't have a reset method, but we can clear the custom user ID
      if (this.clarityInitialized) {
        Clarity.setCustomUserId('')
      }

      if (__DEV__) {
        console.log('[Analytics] User reset')
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to reset user:', error)
      }
    }
  }

  trackScreenView(screenName: string): void {
    if (!this.initialized) return

    try {
      // PostHog
      if (posthogClient) {
        posthogClient.capture('screen_view', { screen_name: screenName })
      }

      // Firebase Analytics
      const firebaseAnalytics = this.getFirebaseAnalytics()
      if (firebaseAnalytics) {
        firebaseAnalytics.logScreenView({
          screen_name: screenName,
          screen_class: screenName,
        })
      }

      // Clarity - explicitly set screen name for better tracking
      if (this.clarityInitialized) {
        Clarity.setCurrentScreenName(screenName)
      }

      if (__DEV__) {
        console.log('[Analytics] Screen view:', screenName)
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to track screen view:', error)
      }
    }
  }

  trackCheckIn(properties: CheckInEventProperties): void {
    this.track('check_in', { ...properties })
  }

  trackPracticeCreated(properties: PracticeCreatedEventProperties): void {
    const props: AnalyticsProperties = { practice_id: properties.practice_id }
    if (properties.template_id) props.template_id = properties.template_id
    this.track('practice_created', props)
  }

  trackLogin(properties: LoginEventProperties): void {
    if (!this.initialized) return

    try {
      // PostHog
      if (posthogClient) {
        posthogClient.capture('login', { method: properties.method })
      }

      // Firebase Analytics - use standard login event
      const firebaseAnalytics = this.getFirebaseAnalytics()
      if (firebaseAnalytics) {
        firebaseAnalytics.logLogin({ method: properties.method })
      }

      if (__DEV__) {
        console.log('[Analytics] Login:', properties.method)
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to track login:', error)
      }
    }
  }

  trackShareCheckIn(properties: ShareCheckInEventProperties): void {
    if (!this.initialized) return

    try {
      // PostHog
      if (posthogClient) {
        posthogClient.capture('share_check_in', { practice_id: properties.practice_id })
      }

      // Firebase Analytics - use standard share event
      const firebaseAnalytics = this.getFirebaseAnalytics()
      if (firebaseAnalytics) {
        firebaseAnalytics.logShare({
          content_type: 'check_in',
          item_id: properties.practice_id,
          method: 'native_share',
        })
      }

      if (__DEV__) {
        console.log('[Analytics] Share check-in:', properties.practice_id)
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to track share:', error)
      }
    }
  }

  private track(eventName: AnalyticsEventName, properties?: AnalyticsProperties): void {
    if (!this.initialized) return

    try {
      // PostHog - filter out undefined values
      if (posthogClient) {
        const posthogProps: Record<string, string | number | boolean> | undefined = properties
          ? (Object.fromEntries(
              Object.entries(properties).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
            ) as Record<string, string | number | boolean>)
          : undefined
        posthogClient.capture(eventName, posthogProps)
      }

      // Firebase Analytics - sanitize properties
      const firebaseAnalytics = this.getFirebaseAnalytics()
      if (firebaseAnalytics) {
        const sanitizedProps = this.sanitizePropertiesForFirebase(properties)
        firebaseAnalytics.logEvent(eventName, sanitizedProps)
      }

      if (__DEV__) {
        console.log('[Analytics] Event tracked:', eventName, properties)
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to track event:', eventName, error)
      }
    }
  }

  async flush(): Promise<void> {
    if (!this.initialized) return

    try {
      if (posthogClient) {
        await posthogClient.flush()
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to flush:', error)
      }
    }
  }

  getClient(): PostHog | null {
    return posthogClient
  }

  // Clarity specific methods
  setCustomTag(key: string, value: string): void {
    if (this.clarityInitialized) {
      try {
        Clarity.setCustomTag(key, value)
      } catch (error) {
        if (__DEV__) {
          console.error('[Analytics] Failed to set Clarity custom tag:', error)
        }
      }
    }
  }
}

export const analyticsService = new AnalyticsService()
