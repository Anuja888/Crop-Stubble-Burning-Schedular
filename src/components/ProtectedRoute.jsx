import { useAuth } from '../context/AuthContext'
import LoginPage from '../pages/LoginPage'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#080818]">
        <div className="text-slate-400">⟳ Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return children
}
