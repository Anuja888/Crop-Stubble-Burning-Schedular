import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import GrainLogo from '../components/GrainLogo'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    
    // Simulated delay
    await new Promise(r => setTimeout(r, 800))
    
    const res = login(email, password)
    if (!res.success) {
      setError(res.error)
      setLoading(false)
    } else {
      addToast(`Welcome, ${email.split('@')[0]}!`, 'success')
      // Navigation is handled by ProtectedRoute
    }
  }

  const handleDemo = async () => {
    setEmail('farmer@example.com')
    setPassword('demo123')
    setError('')
    setLoading(true)
    
    await new Promise(r => setTimeout(r, 800))
    login('farmer@example.com', 'demo123')
    addToast('Welcome, farmer!', 'success')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a2a2a] to-[#080818] px-4">
      <div className="max-w-md w-full bg-[#0d0d24] rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="mb-8">
          <div className="flex justify-center mb-4"><GrainLogo /></div>
          <h1 className="text-3xl font-bold text-white text-center">StubbleSched</h1>
          <p className="text-slate-400 text-center text-sm">Crop Stubble Burning Scheduler</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4 flex items-start gap-2">
            <span>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="farmer@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#080818] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#080818] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-slate-500 text-xs mt-1">Min 6 characters</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition disabled:opacity-50 mt-4"
          >
            {loading ? '⟳ Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-slate-500 text-sm">Or try demo</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={handleDemo}
          className="w-full py-3 bg-[#1a1a3e] border border-white/10 text-slate-300 font-semibold rounded-lg hover:bg-white/10 transition mb-6"
        >
          🚀 Demo Login
        </button>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-slate-400 text-xs font-mono text-center">
          Demo: farmer@example.com / demo123
        </div>
      </div>
    </div>
  )
}
