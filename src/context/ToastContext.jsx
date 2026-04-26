import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  
  const getBgClass = (type) => {
    switch(type) {
      case 'success': return 'bg-emerald-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-amber-500'
      case 'info': return 'bg-blue-500'
      default: return 'bg-slate-500'
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✓'
      case 'error': return '✕'
      case 'warning': return '⚠'
      case 'info': return 'ℹ'
      default: return '•'
    }
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-lg shadow-lg text-white text-sm font-semibold px-4 py-3 flex items-center justify-between gap-2 ${getBgClass(t.type)}`}>
            <div className="flex items-center gap-2">
              <span>{getIcon(t.type)}</span>
              <span>{t.message}</span>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-white/60 hover:text-white transition-colors">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
