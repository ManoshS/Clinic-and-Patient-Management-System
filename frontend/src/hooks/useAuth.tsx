import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { login as apiLogin } from '../api/auth'
import type { TokenPayload } from '../types'

interface AuthContextValue {
  user: TokenPayload | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): TokenPayload {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload)) as TokenPayload
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TokenPayload | null>(() => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const payload = decodeToken(token)
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        return null
      }
      return payload
    } catch {
      return null
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const payload = decodeToken(token)
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password)
    localStorage.setItem('token', res.access_token)
    setUser(decodeToken(res.access_token))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
