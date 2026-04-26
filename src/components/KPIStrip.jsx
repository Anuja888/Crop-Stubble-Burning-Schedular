export default function KPIStrip({ kpis }) {
  const cells = [
    { label: "Min Pollution", value: kpis.minPollution, toneClass: "text-emerald-400" },
    { label: "Optimal Cost", value: kpis.optimalCost, toneClass: "text-blue-400" },
    { label: "Farm Coverage", value: kpis.coverage, toneClass: "text-slate-300" },
    { label: "Prune Rate", value: kpis.pruneRate, toneClass: "text-red-400" },
    { label: "Eco Methods", value: kpis.ecoMethods, toneClass: "text-emerald-400" },
    { label: "DP Improvement", value: kpis.dpImprovement, toneClass: "text-amber-400" }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
      {cells.map((cell, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <div className="font-mono text-[10px] uppercase text-slate-400">{cell.label}</div>
          <div className={`mt-1 text-lg font-extrabold font-mono ${cell.toneClass}`}>
            {cell.value}
          </div>
        </div>
      ))}
    </div>
  )
}
