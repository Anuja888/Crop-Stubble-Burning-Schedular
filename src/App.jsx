import { useState, useMemo } from 'react'
import { runGreedy, runDP, runBacktracking } from './algorithms'
import { DEFAULT_FARMS } from './constants'
import Header from './components/Header'
import TabBar from './components/TabBar'
import InputPanel from './components/InputPanel'
import GanttChart from './components/GanttChart'
import ComparisonPanel from './components/ComparisonPanel'
import ComplexityPanel from './components/ComplexityPanel'
import AboutPanel from './components/AboutPanel'

import { useToast } from './context/ToastContext'
import KPIStrip from './components/KPIStrip'
import AlgoCard from './components/AlgoCard'
import AssignmentTable from './components/AssignmentTable'
import TracePanel from './components/TracePanel'
import RiskHeatmap from './components/RiskHeatmap'
import DonutChart from './components/DonutChart'
import AIRecommender from './components/AIRecommender'

export default function App() {
  const { addToast } = useToast()
  const [showTable, setShowTable] = useState(false)

  const [farms, setFarms] = useState(
    DEFAULT_FARMS.map(f => ({
      ...f,
      window: f.deadline - f.harvestDay,
      method: null
    }))
  )
  const [budget, setBudget] = useState(50000)
  const [tab, setTab] = useState('input')
  const [results, setResults] = useState({ greedy: null, dp: null, backtrack: null })
  const [ganttResult, setGanttResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Ready — select an algorithm and click Run')

  const kpis = useMemo(() => {
    const allR = [results.greedy, results.dp, results.backtrack].filter(Boolean)
    const minPollution = allR.length ? Math.min(...allR.map(r => r.totalPollution)) : 0
    const optimalCost = results.dp?.totalCost ?? 0
    const dpAssignments = results.dp?.farms || []
    const coverageCount = dpAssignments.filter(a => a.method !== 'BURNING').length
    const pruneRate = results.backtrack?.nodesExplored > 0
      ? ((results.backtrack.nodesPruned / results.backtrack.nodesExplored) * 100).toFixed(1) + '%'
      : '0%'
    const ecoMethods = coverageCount
    const dpImp = results.greedy && results.dp && results.greedy.totalPollution > 0
      ? (((results.greedy.totalPollution - results.dp.totalPollution) / results.greedy.totalPollution) * 100).toFixed(1) + '%'
      : '0%'
    return {
      minPollution,
      optimalCost: '₹' + optimalCost.toLocaleString(),
      coverage: coverageCount + '/' + farms.length,
      pruneRate,
      ecoMethods,
      dpImprovement: dpImp,
    }
  }, [results, farms])

  const handleRun = (algo) => {
    setRunning(true)
    setStatusMsg('Running ' + algo + '...')
    setTimeout(() => {
      try {
        if (algo === 'all') {
          const g = runGreedy(farms, budget)
          const d = runDP(farms, budget)
          const bt = runBacktracking(farms, budget)
          setResults({ greedy: g, dp: d, backtrack: bt })
          setGanttResult(d)
          setStatusMsg(`All ran ✓  Greedy: ${g.totalPollution} | DP: ${d.totalPollution} | BT: ${bt.totalPollution} pollution units`)
          addToast(`All algorithms ran ✓ Best: DP with ${d.totalPollution} pollution units`, 'success')
        } else {
          const fn = algo === 'greedy' ? runGreedy : algo === 'dp' ? runDP : runBacktracking
          const r = fn(farms, budget)
          setResults(prev => ({ ...prev, [algo]: r }))
          setGanttResult(r)
          setStatusMsg(`${r.algorithmName}: Pollution=${r.totalPollution} | Cost=₹${r.totalCost} | Time=${r.timeMs}ms`)
          addToast(`${r.algorithmName} complete — ${r.totalPollution} pollution units`, 'success')
        }
      } catch (e) {
        setStatusMsg('Error: ' + e.message)
        addToast('Error: ' + e.message, 'error')
      }
      setRunning(false)
    }, 30)
  }

  return (
    <div className="flex flex-col h-screen bg-[#080818] overflow-hidden">
      <Header />
      <TabBar tab={tab} setTab={setTab} />

      <div className="flex-1 overflow-hidden">
        {tab === 'input' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 pt-3 flex-shrink-0">
              <KPIStrip kpis={kpis} />
            </div>
            <div className="flex flex-1 min-h-0">
              <InputPanel
                farms={farms} setFarms={setFarms}
                budget={budget} setBudget={setBudget}
                onRun={handleRun} running={running}
                statusMsg={statusMsg}
                results={results}
              />
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-auto">
                  <GanttChart result={ganttResult} />
                </div>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="text-xs text-slate-400 hover:text-white border-t border-white/10 w-full py-2 text-center"
                >
                  📋 Assignment Details {showTable ? '▾' : '▸'}
                </button>
                {showTable && (
                  <div className="px-4 pb-4 max-h-[40%] overflow-auto">
                    <AssignmentTable result={ganttResult} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === 'comparison' && (
          <div className="h-full flex flex-col">
            <div className="flex gap-3 p-4 overflow-x-auto flex-shrink-0">
              <AlgoCard title="Greedy" icon="⚡" badge="FAST" result={results.greedy} farmsLength={farms.length} />
              <AlgoCard title="Dynamic Programming" icon="🧠" badge="OPTIMAL" result={results.dp} farmsLength={farms.length} />
              <AlgoCard title="Backtracking" icon="🔍" badge="EXACT" result={results.backtrack} farmsLength={farms.length} />
            </div>
            <div className="flex-1 overflow-hidden">
              <ComparisonPanel results={results} farmCount={farms.length} />
            </div>
          </div>
        )}
        {tab === 'complexity' && (
          <ComplexityPanel farms={farms} budget={budget} />
        )}
        {tab === 'trace' && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-auto h-full">
            <TracePanel title="⚡ Greedy Decisions" lines={results.greedy?.stepTrace} color="greedy" />
            <TracePanel title="🧠 DP Trace" lines={results.dp?.stepTrace} color="dp" />
            <TracePanel title="🔍 Backtracking Prune Trace" lines={results.backtrack?.stepTrace} color="backtrack" />
          </div>
        )}
        {tab === 'extras' && (
          <div className="p-4 space-y-4 overflow-auto h-full">
            <RiskHeatmap farms={farms} />
            <DonutChart result={results.dp || results.greedy || results.backtrack} farms={farms} />
            <AIRecommender farms={farms} budget={budget} />
          </div>
        )}
        {tab === 'about' && <AboutPanel />}
      </div>
    </div>
  )
}
