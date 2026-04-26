import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()

  const handleLogout = () => {
    logout()
    addToast('Signed out', 'info')
  }

  return (
    <header className="flex items-center justify-between px-6 h-14
                        bg-[#0d0d24] border-b border-indigo-500/30
                        flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌾</span>
        <div>
          <h1 className="text-lg font-black text-white leading-none tracking-tight">
            Crop Stubble Burning Scheduler
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Design & Analysis of Algorithms
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            DAA Project
          </span>
          <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold cursor-default select-none">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 transition font-semibold px-2 py-1">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
