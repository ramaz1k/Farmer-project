import { createContext, useContext, useState } from 'react'
import { api, clearSession, getUser, saveSession } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())

  async function login(email, password) {
    const res = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
    saveSession(res)
    setUser({ email: res.email, role: res.role })
    return res
  }

  async function register(email, password, role) {
    const res = await api('/auth/register', {
      method: 'POST',
      body: { email, password, role },
      auth: false,
    })
    saveSession(res)
    setUser({ email: res.email, role: res.role })
    return res
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
