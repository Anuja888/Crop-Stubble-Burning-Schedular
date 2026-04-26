export default function AIRecommender({ farms, budget }) {
  const getRecommendation = (farm, budgetLeft) => {
    const window = farm.deadline - farm.harvestDay
    const risk = window <= 3 ? 'HIGH' : window <= 7 ? 'MED' : 'LOW'

    if (risk === 'HIGH') {
      return { method: 'BURNING', reason: 'Deadline is very tight; only 1-day method is safe for feasibility.', confidence: 85 }
    } else if (window >= 7 && budgetLeft >= 20000) {
      return { method: 'MULCHING', reason: 'Long window and healthy budget: zero-pollution method is optimal.', confidence: 90 }
    } else if (budgetLeft < 7000) {
      return { method: 'BIO', reason: 'Budget-constrained: low-cost Bio-decomposer balances cost and pollution.', confidence: 80 }
    } else {
      return { method: 'BIO', reason: 'Default: Bio-decomposer offers best cost-pollution tradeoff.', confidence: 72 }
    }
  }

  const methodDisplay = {
    BURNING: 'Burning 🔥',
    BIO: 'Bio-decomp 🧪',
    MULCHING: 'Mulching 🌿',
    MANUAL: 'Manual 🔧'
  }

  return (
    <div className="space-y-3">
      {farms.map((farm, idx) => {
        const rec = getRecommendation(farm, budget)
        return (
          <div key={farm.id || idx} className="rounded-xl border border-white/8 bg-white/3 p-3 mb-2">
            <div className="flex justify-between items-center font-mono text-xs mb-1">
              <span className="text-slate-400 font-bold">{farm.id}</span>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-blue-300 text-xs">
                {methodDisplay[rec.method]}
              </span>
              <span className="text-slate-500 text-[10px]">{rec.confidence}% confidence</span>
            </div>
            <p className="text-slate-500 text-[10px] italic leading-relaxed">
              {rec.reason}
            </p>
          </div>
        )
      })}
    </div>
  )
}
