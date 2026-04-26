export default function TracePanel({ title, lines, color }) {
  const getColorClass = (c) => {
    switch(c) {
      case 'greedy': return 'text-amber-400'
      case 'backtrack': return 'text-red-400'
      case 'dp': return 'text-blue-400'
      default: return 'text-white'
    }
  }

  const getLineColor = (line) => {
    if (line.includes('PRUNE')) return 'text-red-400'
    if (line.includes('SUCCESS') || line.includes('Selected')) return 'text-emerald-400'
    return 'text-amber-400'
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col h-full">
      <div className={`font-mono text-xs font-bold text-slate-300 mb-2 flex items-center gap-2`}>
        <span className={getColorClass(color)}>●</span> {title}
      </div>
      <div className="flex-1 max-h-72 overflow-y-auto rounded-lg bg-[#050510] p-3 font-mono text-[11px] space-y-1">
        {(!lines || lines.length === 0) ? (
          <div className="text-slate-500">— Run algorithm to see trace —</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className={getLineColor(line)}>{line}</div>
          ))
        )}
      </div>
    </div>
  )
}
