import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, AuthTokens, AuthUser } from '../types'
import { ADMIN_USER, MEMBER_USER } from '../lib/dummy-data'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  login: (auth: AuthResponse) => void
  logout: () => void
  switchRole: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'susu-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as AuthResponse
      setUser(parsed.user)
      setAccessToken(parsed.accessToken)
      setRefreshToken(parsed.refreshToken)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = (auth: AuthResponse) => {
    setUser(auth.user)
    setAccessToken(auth.accessToken)
    setRefreshToken(auth.refreshToken)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const switchRole = () => {
    if (!user) return

    if (user.role === 'admin') {
      setUser(MEMBER_USER)
    } else {
      setUser(ADMIN_USER)
    }

    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
