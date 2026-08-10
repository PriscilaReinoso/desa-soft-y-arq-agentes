import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LoginRequest, LoginResponse, Usuario } from '../types/domain'
import { login as loginRequest } from '../services/auth.service'
import { clearToken, getToken, setToken } from '../services/http'

const USUARIO_STORAGE_KEY = 'ferrestock.usuario'

type AuthContextValue = {
  isAuthenticated: boolean
  token: string | null
  usuario: Usuario | null
  login: (credentials: LoginRequest) => Promise<Usuario>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): Usuario | null {
  try {
    const raw = localStorage.getItem(USUARIO_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [usuario, setUsuario] = useState<Usuario | null>(() => readStoredUser())

  const clearSession = useCallback(() => {
    clearToken()
    localStorage.removeItem(USUARIO_STORAGE_KEY)
    setTokenState(null)
    setUsuario(null)
  }, [])

  useEffect(() => {
    const onUnauthorized = () => clearSession()
    window.addEventListener('ferrestock:unauthorized', onUnauthorized)
    return () => window.removeEventListener('ferrestock:unauthorized', onUnauthorized)
  }, [clearSession])

  const login = useCallback(async (credentials: LoginRequest): Promise<Usuario> => {
    const response: LoginResponse = await loginRequest(credentials)
    setToken(response.access_token)
    setTokenState(response.access_token)
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(response.usuario))
    setUsuario(response.usuario)
    return response.usuario
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: Boolean(token), token, usuario, login, logout }),
    [token, usuario, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return ctx
}
