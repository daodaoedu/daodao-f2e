import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { authStorage, type StoredUser, type AuthTokens } from '@/services/auth-storage'
import { analyticsService } from '@/services/analytics'

interface AuthState {
  user: StoredUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

type LoginMethod = 'google' | 'apple' | 'email'

interface AuthContextValue extends AuthState {
  signIn: (tokens: AuthTokens, user: StoredUser, loginMethod?: LoginMethod) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (user: StoredUser) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean) {
  const segments = useSegments()
  const router = useRouter()
  const lastNavigationRef = useRef<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
    let targetRoute: string | null = null

    if (!isAuthenticated && !inAuthGroup) {
      targetRoute = '/(auth)/login'
    } else if (isAuthenticated && inAuthGroup) {
      targetRoute = '/(tabs)'
    }

    // Prevent duplicate navigation
    if (targetRoute && targetRoute !== lastNavigationRef.current) {
      lastNavigationRef.current = targetRoute
      router.replace(targetRoute as `${string}:${string}`)
    }
  }, [isAuthenticated, isLoading, segments, router])
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const isMountedRef = useRef(true)

  // Initialize: Load auth state from SecureStore
  useEffect(() => {
    isMountedRef.current = true

    async function loadAuthState() {
      try {
        const [tokens, user] = await Promise.all([
          authStorage.getTokens(),
          authStorage.getUser(),
        ])

        if (!isMountedRef.current) return

        if (tokens && user) {
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          // Clear any partial data
          if (tokens || user) {
            await authStorage.clearAll()
          }
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        if (!isMountedRef.current) return

        if (__DEV__) {
          console.error('Failed to load auth state:', error)
        }
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    loadAuthState()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Protected route navigation
  useProtectedRoute(state.isAuthenticated, state.isLoading)

  const signIn = useCallback(async (tokens: AuthTokens, user: StoredUser, loginMethod?: LoginMethod) => {
    try {
      await Promise.all([
        authStorage.setTokens(tokens),
        authStorage.setUser(user),
      ])

      if (!isMountedRef.current) return

      // Track login event and identify user
      analyticsService.identify({
        id: user.id,
        email: user.email,
        name: user.name,
      })
      if (loginMethod) {
        analyticsService.trackLogin({ method: loginMethod })
      }

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      if (__DEV__) {
        console.error('Sign in failed:', error)
      }
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authStorage.clearAll()

      // Reset analytics user
      analyticsService.reset()

      if (!isMountedRef.current) return

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      if (__DEV__) {
        console.error('Sign out failed:', error)
      }
      throw error
    }
  }, [])

  const updateUser = useCallback(async (user: StoredUser) => {
    try {
      await authStorage.setUser(user)

      if (!isMountedRef.current) return

      setState(prev => ({ ...prev, user }))
    } catch (error) {
      if (__DEV__) {
        console.error('Update user failed:', error)
      }
      throw error
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
