import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid,
         Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { runGreedy, runDP, runBacktracking } from '../algorithms'

export default function ComplexityPanel({ farms, budget }) {
  const [data, setData] = useState([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState('')

  const runAnalysis = async () => {
    setRunning(true)
    setData([])
    const nValues = [5, 10, 15, 20, 25, 30]
    const results = []

    for (const n of nValues) {
      setProgress(`Testing n=${n} farms...`)
      await new Promise(r => setTimeout(r, 50))

      // Generate n random farms
      const testFarms = Array.from({length:n}, (_,i) => ({
        id: 'F'+(i+1),
        harvestDay: 5 + Math.floor(Math.random()*10),
        deadline: 0,
        window: 7 + Math.floor(Math.random()*8),
        method: null
      }))
      testFarms.forEach(f => f.deadline = f.harvestDay + f.window)

      const testBudget = n * 3000

      const g  = runGreedy(testFarms, testBudget)
      const d  = runDP(testFarms, testBudget)
      const bt = runBacktracking(testFarms, testBudget)

      // Brute force simulated: 4^n * tiny_constant
      const bfTime = Math.pow(4, n) * 0.000001

      results.push({
        n,
        'Greedy':      Math.max(g.timeMs, 0.1),
        'DP':          Math.max(d.timeMs, 0.1),
        'Backtracking':Math.max(bt.timeMs, 0.1),
        'Brute Force': Math.min(bfTime, 100000),
      })
      setData([...results])
    }

    setProgress('Analysis complete ✓')
    setRunning(false)
  }

  const COLORS = {
    'Greedy':      '#f59e0b',
    'DP':          '#6366f1',
    'Backtracking':'#8b5cf6',
    'Brute Force': '#ef4444',
  }

  return (
    <div className="h-full overflow-auto bg-[#080818] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">
          Algorithm Complexity Analysis
        </h2>
        <button onClick={runAnalysis} disabled={running}
          className="btn-primary bg-indigo-500 hover:bg-indigo-400
                     text-white disabled:opacity-40 px-6">
          {running ? '⏳ Running...' : '▶ Run Analysis'}
        </button>
      </div>

      {progress && (
        <p className="text-sm text-slate-400 mb-4">{progress}</p>
      )}

      {/* Graph */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
          Execution Time vs Number of Farms
        </h3>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-600">
            <p>Click "Run Analysis" to generate the chart</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{top:5,right:20,left:0,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
              <XAxis dataKey="n"
                label={{value:'Farms (n)',position:'insideBottom',offset:-2,fill:'#64748b'}}
                tick={{fill:'#94a3b8'}} axisLine={{stroke:'#2d3a6e'}}/>
              <YAxis tick={{fill:'#94a3b8'}} axisLine={false}
                label={{value:'Time (ms)',angle:-90,position:'insideLeft',fill:'#64748b'}}/>
              <Tooltip
                contentStyle={{background:'#0f0f23',border:'1px solid #2d3a6e',
                               borderRadius:8,color:'#f1f5f9'}}/>
              <Legend wrapperStyle={{color:'#94a3b8'}}/>
              {Object.keys(COLORS).map(key => (
                <Line key={key} type="monotone" dataKey={key}
                  stroke={COLORS[key]} strokeWidth={2.5}
                  dot={{r:4,fill:COLORS[key]}}
                  activeDot={{r:6}}
                  connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Complexity table */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
          Theoretical Complexity
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['Algorithm','Best Case','Average Case','Worst Case'].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left font-bold text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Brute Force', 'O(4ⁿ)',    'O(4ⁿ)',      'O(4ⁿ)',    'red'],
              ['Greedy',      'O(n log n)','O(n log n)', 'O(n log n)','amber'],
              ['Dynamic Prog','O(n × B)', 'O(n × B)',   'O(n × B)', 'indigo'],
              ['Backtracking','O(1)*',    'O(4ⁿ/k)',    'O(4ⁿ)',    'purple'],
            ].map(([algo,...cases],i)=>{
              const color = cases.pop()
              const textC = {red:'text-red-400',amber:'text-amber-400',
                             indigo:'text-indigo-400',purple:'text-purple-400'}[color]
              return (
                <tr key={algo}
                  className={`border-b border-white/5
                              ${i%2===0?'bg-white/[0.02]':''}`}>
                  <td className={`px-4 py-3 font-bold ${textC}`}>{algo}</td>
                  {cases.map((c,j)=>(
                    <td key={j} className="px-4 py-3 font-mono text-slate-300 text-xs">
                      {c}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-3">
          * Backtracking best case: solution found and pruned immediately
        </p>
      </div>
    </div>
  )
}
