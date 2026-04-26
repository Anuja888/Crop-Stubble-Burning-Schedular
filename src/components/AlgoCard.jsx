export default function AlgoCard({ title, icon, badge, result, farmsLength }) {
  if (!result) {
    return (
      <div className="flex-1 min-w-[300px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm flex items-center justify-center">
        <span className="text-slate-500">— Not run yet —</span>
      </div>
    )
  }

  const getBadgeStyle = (b) => {
    switch(b) {
      case 'FAST': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'OPTIMAL': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'EXACT': return 'bg-red-500/10 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  const covered = (result.farms || []).filter(f => f.method !== 'BURNING').length
  const total = farmsLength || (result.farms || []).length
  const progressWidth = total > 0 ? Math.max(5, Math.min(100, 100 - (result.totalPollution / (total * 100)) * 100)) : 100

  return (
    <div className="flex-1 min-w-[300px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="font-mono text-sm font-bold text-slate-200 flex items-center gap-2">
          <span>{icon}</span> {title}
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(badge)}`}>
          {badge}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs text-slate-400 mt-3">
        <div>Cost: ₹{result.totalCost?.toLocaleString() ?? 0}</div>
        <div>Pollution: {result.totalPollution}</div>
        <div>Time: {result.timeMs}ms</div>
        <div>Coverage: {covered}/{total}</div>
        <div>Nodes: {result.nodesExplored ?? 'N/A'}</div>
        <div>Pruned: {result.nodesPruned ?? 'N/A'}</div>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressWidth}%` }}></div>
      </div>
    </div>
  )
}
