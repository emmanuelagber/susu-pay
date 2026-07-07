import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, AuthTokens, AuthUser } from '../types'
import { apiLogout } from '../lib/api'
// import { ADMIN_USER, MEMBER_USER } from '../lib/dummy-data'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  login: (auth: AuthResponse) => void
  logout: () => Promise<void>
  // switchRole: (nextRole?: 'admin' | 'member') => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'susu-auth'

function loadStoredAuth(): AuthResponse | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthResponse
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialAuth = loadStoredAuth()
  const [user, setUser] = useState<AuthUser | null>(initialAuth?.user ?? null)
  const [accessToken, setAccessToken] = useState<string | null>(initialAuth?.accessToken ?? null)
  const [refreshToken, setRefreshToken] = useState<string | null>(initialAuth?.refreshToken ?? null)

  const login = (auth: AuthResponse) => {
    setUser(auth.user)
    setAccessToken(auth.accessToken)
    setRefreshToken(auth.refreshToken)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  }

  const logout = async () => {
    const currentRefreshToken = refreshToken

    if (currentRefreshToken) {
      try {
        await apiLogout(currentRefreshToken)
      } catch {
        // Best-effort — still clear the local session below even if the server call fails.
      }
    }

    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

 

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
