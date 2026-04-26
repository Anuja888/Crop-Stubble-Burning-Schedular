export default function RiskHeatmap({ farms }) {
  const getRisk = (window) => {
    if (window <= 3) return 'HIGH'
    if (window <= 7) return 'MED'
    return 'LOW'
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return 'bg-red-500/70'
      case 'MED': return 'bg-amber-500/70'
      case 'LOW': return 'bg-emerald-500/70'
      default: return 'bg-slate-500/70'
    }
  }

  const getRiskTextColor = (risk) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400'
      case 'MED': return 'text-amber-400'
      case 'LOW': return 'text-emerald-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {farms.map((farm, idx) => {
        const window = farm.deadline - farm.harvestDay
        const risk = getRisk(window)
        return (
          <div key={farm.id || idx} className="rounded-xl border border-white/10 bg-[#0d0d24] p-2 min-w-0">
            <div className="font-mono text-xs text-slate-400 mb-1 truncate">{farm.id}</div>
            <div className="grid grid-cols-4 gap-1 mb-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-3 rounded ${getRiskColor(risk)}`}></div>
              ))}
            </div>
            <p className={`text-[9px] font-mono font-bold uppercase tracking-widest mt-1 ${getRiskTextColor(risk)}`}>
              {risk}
            </p>
          </div>
        )
      })}
    </div>
  )
}
