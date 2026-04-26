import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { METHODS } from '../constants'

export default function ComparisonPanel({ results, farmCount }) {
  const { greedy, dp, backtrack } = results
  const baseline = farmCount * 100

  const barData = [
    { name: 'Baseline', pollution: baseline, color: '#ef4444' },
    { name: 'Greedy', pollution: greedy?.totalPollution ?? null, color: '#f59e0b' },
    { name: 'DP', pollution: dp?.totalPollution ?? null, color: '#10b981' },
    { name: 'Backtrack', pollution: backtrack?.totalPollution ?? null, color: '#8b5cf6' },
  ].filter(d => d.pollution !== null)

  return (
    <div className="h-full overflow-auto bg-[#080818] p-6">
      <h2 className="text-xl font-black text-white mb-6">
        Algorithm Comparison
      </h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="BASELINE"
          subtitle="All Burning"
          pollution={baseline}
          cost={0}
          time="—"
          accent="red"
          badge={null}
        />
        <MetricCard
          title="GREEDY"
          subtitle="Fast heuristic"
          pollution={greedy?.totalPollution}
          cost={greedy?.totalCost}
          time={greedy ? greedy.timeMs + 'ms' : null}
          accent="amber"
          badge={null}
        />
        <MetricCard
          title="DP OPTIMAL"
          subtitle="Guaranteed best"
          pollution={dp?.totalPollution}
          cost={dp?.totalCost}
          time={dp ? dp.timeMs + 'ms' : null}
          accent="emerald"
          badge="BEST"
        />
        <MetricCard
          title="BACKTRACKING"
          subtitle="Exhaustive search"
          pollution={backtrack?.totalPollution}
          cost={backtrack?.totalCost}
          time={backtrack ? (backtrack.timeMs || '<1') + 'ms' : null}
          accent="purple"
          badge={null}
        />
      </div>

      {/* Bar Chart */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
          Pollution Comparison
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#2d3a6e' }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#0f0f23', border: '1px solid #2d3a6e',
                borderRadius: 8, color: '#f1f5f9'
              }} />
            <Bar dataKey="pollution" radius={[6, 6, 0, 0]}>
              {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-farm table */}
      {greedy && dp && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
            Per-Farm Method Comparison
          </h3>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {['Farm', 'Window', 'Greedy', 'DP Optimal', 'Match'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {greedy.farms.map((gf, i) => {
                  const df = dp.farms[i]
                  const same = gf.method === df?.method
                  return (
                    <tr key={gf.id}
                      className={`border-b border-white/5 text-xs
                                  ${!same ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-3 py-2 font-bold text-indigo-300 font-mono">
                        {gf.id}
                      </td>
                      <td className="px-3 py-2">
                        <span className={gf.window < 8 ? 'font-bold text-amber-400' : 'text-slate-300'}>
                          {gf.window}d
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <MethodBadge method={gf.method} />
                      </td>
                      <td className="px-3 py-2">
                        <MethodBadge method={df?.method} />
                      </td>
                      <td className="px-3 py-2 text-lg">
                        {same ? '✅' : '⚠️'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, subtitle, pollution, cost, time, accent, badge }) {
  const accents = {
    red: 'border-red-500/30 bg-red-500/5',
    amber: 'border-amber-500/30 bg-amber-500/5',
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  }
  const textColors = {
    red: 'text-red-400', amber: 'text-amber-400',
    emerald: 'text-emerald-400', purple: 'text-purple-400'
  }
  return (
    <div className={`rounded-xl border p-4 ${accents[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {badge && (
          <span className="badge bg-emerald-500/20 text-emerald-400
                           border border-emerald-500/30 text-[10px]">
            {badge}
          </span>
        )}
      </div>
      {pollution != null ? (
        <>
          <p className={`text-3xl font-black ${textColors[accent]}`}>
            {pollution}
          </p>
          <p className="text-xs text-slate-500 mb-2">pollution units</p>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Cost</span>
              <span className="font-bold text-slate-200">
                ₹{cost?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span className="font-bold text-slate-200">{time}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-slate-600 text-sm mt-2">Run algorithm first</p>
      )}
    </div>
  )
}

function MethodBadge({ method }) {
  if (!method) return <span className="text-slate-600">—</span>
  const styles = {
    BURNING: 'bg-red-500/20 text-red-400 border-red-500/30',
    MULCHING: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    BIO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    MANUAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }
  return (
    <span className={`badge border ${styles[method]}`}>
      {METHODS[method]?.short}
    </span>
  )
}
