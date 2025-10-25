import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { setTokens, clearTokens, getRefreshToken } from './token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // { email, balance, currency }
  const [loading, setLoading] = useState(true) // true pendant restauration session

  // Récupère /auth/me (avec access si présent; sinon tentera refresh via intercepteur si 401)
  const fetchMe = useCallback(async () => {
    try {
      const meAuth = await api.get('/auth/me/')

      // on recuperer le solde VC
      const meWallet = await api.get('/wallet/me/')
      setUser({
        email: meAuth.data.email,
        balance_vc: meWallet.data.balance_vc,
        rate_xaf_per_vc: meWallet.data.rate_xaf_per_vc,
      })
    } catch {
      setUser(null)
    }
  }, [])

  // Au montage: si refresh token existe, tente un /auth/refresh puis /auth/me
  useEffect(() => {
    const boot = async () => {
      try {
        const refresh = getRefreshToken()
        if (refresh) {
          // tente un refresh pour obtenir un access frais
          const r = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
          })
          if (r.ok) {
            const data = await r.json()
            if (data.access) setTokens({ access: data.access, refresh })
          } else {
            clearTokens()
          }
        }
        await fetchMe()
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [fetchMe])

  const login = async ({ email, password }) => {
    const res = await api.post('/auth/login/', { email, password })
    // Le backend renvoie: { access, refresh, user: {...} }
    const { access, refresh, user } = res.data
    setTokens({ access, refresh })
    setUser(user)
    return user
  }

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
