const TABS = [
  { id: 'input',      label: '📋 Input & Results' },
  { id: 'comparison', label: '📊 Comparison'      },
  { id: 'complexity', label: '📈 Complexity'       },
  { id: 'trace',      label: '🔍 Trace'           },
  { id: 'extras',     label: '🛰️ Extras'          },
  { id: 'about',      label: 'ℹ About'            },
]

export default function TabBar({ tab, setTab }) {
  return (
    <nav className="flex bg-[#0d0d24] border-b border-white/5 flex-shrink-0 px-4">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`px-5 py-3 text-sm font-semibold transition-all duration-150
                      border-b-2 -mb-px
                      ${tab === t.id
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
