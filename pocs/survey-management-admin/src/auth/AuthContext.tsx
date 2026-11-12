import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authLogout, getAuthMe } from '@/api/admin'
import { TOKEN_KEY } from '@/api/client'
import type { AuthMeUser } from '@/api/types'
import { USE_PREVIEW_MOCK } from '@/config'

const ADMIN_ROLES = ['admin', 'superadmin', 'Admin', 'SuperAdmin']

interface AdminInfo {
  userId: string
  nickname: string | null
  email: string | null
  photoUrl: string | null
  roles: string[]
  permissions: string[]
}

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  adminInfo: AdminInfo | null
  login: (token: string) => Promise<boolean>
  loginWithGoogle: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function hasAdminRole(roles: string[]): boolean {
  return roles.some((r) => ADMIN_ROLES.includes(r))
}

function toAdminInfo(user: AuthMeUser): AdminInfo {
  return {
    userId: user.id,
    nickname: user.nickname ?? user.name,
    email: user.email,
    photoUrl: user.photo_url,
    roles: user.roles,
    permissions: user.permissions,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)

  useEffect(() => {
    // 預覽模式不打 /auth/me：後端可達時會回 401，且預覽本來就不需要登入狀態
    if (USE_PREVIEW_MOCK) {
      setIsLoading(false)
      return
    }
    getAuthMe()
      .then((res) => {
        const { user, isTemporary } = res.data.data
        if (isTemporary || !hasAdminRole(user.roles)) {
          throw new Error('not admin')
        }
        setAdminInfo(toAdminInfo(user))
        setIsAuthenticated(true)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setIsAuthenticated(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (token: string): Promise<boolean> => {
    localStorage.setItem(TOKEN_KEY, token)
    try {
      const res = await getAuthMe()
      const { user, isTemporary } = res.data.data
      if (isTemporary || !hasAdminRole(user.roles)) {
        localStorage.removeItem(TOKEN_KEY)
        setIsAuthenticated(false)
        return false
      }
      setAdminInfo(toAdminInfo(user))
      setIsAuthenticated(true)
      return true
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  const loginWithGoogle = useCallback(() => {
    window.location.href = '/daodao-server/api/v1/auth/google?redirectUrl=/dashboard&source=admin'
  }, [])

  const logout = useCallback(async () => {
    try {
      await authLogout()
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY)
    setIsAuthenticated(false)
    setAdminInfo(null)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, adminInfo, login, loginWithGoogle, logout }),
    [isAuthenticated, isLoading, adminInfo, login, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
