import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const saved = localStorage.getItem('stubble-user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } 
      catch { localStorage.removeItem('stubble-user') }
    }
    setLoading(false)
  }, [])
  
  const login = (email, password) => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRe.test(email))
      return { success: false, error: 'Valid email required' }
    if (!password || password.length < 6)
      return { success: false, error: 'Password must be ≥ 6 characters' }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      loginTime: new Date().toISOString(),
    }
    setUser(newUser)
    localStorage.setItem('stubble-user', JSON.stringify(newUser))
    return { success: true }
  }
  
  const logout = () => {
    setUser(null)
    localStorage.removeItem('stubble-user')
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
