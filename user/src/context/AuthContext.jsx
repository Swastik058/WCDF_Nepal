import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, isAuthenticated } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

