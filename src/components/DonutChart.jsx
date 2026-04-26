import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DonutChart({ result, farms }) {
  // Use algorithm result if available, otherwise show current farm data
  const displayFarms = (result && result.farms) || farms || []

  if (displayFarms.length === 0) {
    return (
      <div className="text-slate-500 text-xs text-center py-8">
        Add farms or run an algorithm to see distribution
      </div>
    )
  }

  const counts = displayFarms.reduce((acc, farm) => {
    const m = farm.method || 'BURNING'
    acc[m] = (acc[m] || 0) + 1
    return acc
  }, {})

  const displayNames = {
    BURNING: "Burning",
    BIO: "Bio-decomp",
    MULCHING: "Mulching",
    MANUAL: "Manual"
  }

  const data = Object.keys(counts).map(key => ({
    name: displayNames[key] || key,
    value: counts[key]
  }))

  const colorsMap = {
    "Burning": "#ef4444",
    "Mulching": "#10b981",
    "Bio-decomp": "#3b82f6",
    "Manual": "#f59e0b"
  }

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={colorsMap[entry.name] || '#cbd5e1'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#cbd5e1', fontSize: '11px' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
