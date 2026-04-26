import { METHODS } from '../constants'

export default function AssignmentTable({ result }) {
  if (!result || !result.farms || result.farms.length === 0) {
    return (
      <div className="text-slate-500 text-center py-8">
        Run an algorithm to see assignments
      </div>
    )
  }

  const getMethodDetails = (method) => {
    switch (method) {
      case 'BURNING': return { name: '🔥 Burning', style: 'bg-red-500/10 text-red-400 border-red-500/30', grade: 'F', gradeStyle: 'bg-red-500 text-white' }
      case 'MULCHING': return { name: '🌿 Mulching', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', grade: 'A+', gradeStyle: 'bg-emerald-500 text-white' }
      case 'BIO': return { name: '🧪 Bio-decomp', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30', grade: 'A+', gradeStyle: 'bg-emerald-500 text-white' }
      case 'MANUAL': return { name: '🔧 Manual', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30', grade: 'B', gradeStyle: 'bg-amber-500 text-white' }
      default: return { name: 'Unknown', style: 'bg-slate-500/10 text-slate-400', grade: 'N/A', gradeStyle: 'bg-slate-500 text-white' }
    }
  }

  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm mt-3">
      <table className="min-w-full text-left text-xs font-mono">
        <thead className="bg-white/5 font-bold uppercase text-slate-400 text-[11px]">
          <tr>
            <th className="px-3 py-2">Farm ID</th>
            <th className="px-3 py-2">Harvest</th>
            <th className="px-3 py-2">Deadline</th>
            <th className="px-3 py-2">Window</th>
            <th className="px-3 py-2">Method</th>
            <th className="px-3 py-2">Duration</th>
            <th className="px-3 py-2">Cost</th>
            <th className="px-3 py-2">Pollution</th>
            <th className="px-3 py-2">P-Level</th>
            <th className="px-3 py-2">Eco Grade</th>
          </tr>
        </thead>
        <tbody>
          {result.farms.map((farm, idx) => {
            const methodKey = farm.method || 'BURNING'
            const mDetails = getMethodDetails(methodKey)
            const mStats = METHODS[methodKey] || { days: 0, cost: 0, pollution: 0 }
            const window = farm.deadline - farm.harvestDay
            
            return (
              <tr key={farm.id || idx} className="border-t border-white/5 hover:bg-white/5 transition">
                <td className="px-3 py-2 text-slate-200 font-bold">{farm.id}</td>
                <td className="px-3 py-2">Oct {farm.harvestDay}</td>
                <td className="px-3 py-2">Oct {farm.deadline}</td>
                <td className="px-3 py-2">
                  {window < 8 ? (
                    <span className="font-bold text-amber-400">{window}d ⚡</span>
                  ) : (
                    <span className="text-slate-400">{window}d</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full border ${mDetails.style}`}>
                    {mDetails.name}
                  </span>
                </td>
                <td className="px-3 py-2">{mStats.days}d</td>
                <td className="px-3 py-2">₹{mStats.cost.toLocaleString()}</td>
                <td className="px-3 py-2">{mStats.pollution} units</td>
                <td className="px-3 py-2">
                  <div className="h-2 w-16 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(mStats.pollution / 100) * 100}%` }}></div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${mDetails.gradeStyle}`}>
                    {mDetails.grade}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
