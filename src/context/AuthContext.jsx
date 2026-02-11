import { createContext, useContext, useState, useEffect } from 'react'

const AUTH_KEY = 'setly-auth'

function loadUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveUser(user) {
  try {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    else localStorage.removeItem(AUTH_KEY)
  } catch (_) {}
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(loadUser())
  }, [])

  const login = (userData) => {
    const u = {
      id: userData.id,
      name: userData.name,
      role: userData.role, // 'coach' | 'player' | 'parent' | 'director'
      playerId: userData.playerId, // for parents: the player they're guardian of
    }
    setUser(u)
    saveUser(u)
  }

  const logout = () => {
    setUser(null)
    saveUser(null)
  }

  const isCoach = user?.role === 'coach'
  const isPlayer = user?.role === 'player'
  const isParent = user?.role === 'parent'
  const isDirector = user?.role === 'director'
  const canManageTeam = isCoach || isDirector
  const canEditOwnPlayer = (playerId) =>
    (isPlayer && user?.id === playerId) || (isParent && user?.playerId === playerId)

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isCoach,
        isPlayer,
        isParent,
        isDirector,
        canManageTeam,
        canEditOwnPlayer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
