import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { tokenStorage } from '@/shared/api/httpClient'
import { authApi } from '@/modules/auth/api/auth.api'
import type { AuthUser, LoginPayload } from '@/modules/auth/types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => tokenStorage.get() !== null)

  // Bootstrap session from a stored token (Fase 1: /auth/me).
  useEffect(() => {
    if (!tokenStorage.get()) {
      return
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { token, user: authUser } = await authApi.login(payload)
    tokenStorage.set(token)
    setUser(authUser)
    return authUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, logout }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return context
}
