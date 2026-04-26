import { METHODS } from '../constants'
import { generateReport } from '../reportGenerator'
import { useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'

export default function InputPanel({ farms, setFarms, budget, setBudget,
  onRun, running, statusMsg, results }) {
  const { addToast } = useToast()
  const fileRef = useRef(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFarmData, setNewFarmData] = useState({ id: '', harvestDay: '', deadline: '' })

  const handleExport = () => {
    if (!results || !results.greedy || !results.dp || !results.backtrack) {
      alert("Please 'Run All' algorithms first to generate the full comparison report.");
      return;
    }
    generateReport(results.greedy, results.dp, results.backtrack, budget);
  };

  const handleExportConfig = () => {
    const config = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      farms: farms.map(f => ({
        id: f.id,
        harvestDay: f.harvestDay,
        deadline: f.deadline
      })),
      budget: budget,
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stubble-config-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Configuration exported!', 'success')
  }

  const handleImportConfig = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const config = JSON.parse(evt.target.result)
        if (!Array.isArray(config.farms) || config.farms.length === 0)
          throw new Error('Invalid: farms array missing')
        if (typeof config.budget !== 'number' || config.budget <= 0)
          throw new Error('Invalid: budget must be positive number')
        config.farms.forEach((f, i) => {
          if (!f.id) throw new Error(`Farm ${i + 1}: id missing`)
          if (f.deadline <= f.harvestDay)
            throw new Error(`Farm ${f.id}: deadline must be > harvestDay`)
        })
        setFarms(config.farms.map(f => ({
          ...f,
          window: f.deadline - f.harvestDay,
          method: null
        })))
        setBudget(config.budget)
        addToast(`Config imported: ${config.farms.length} farms, ₹${config.budget.toLocaleString()} budget`, 'success')
      } catch (err) {
        addToast('Import failed: ' + err.message, 'error')
      }
      fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const openAddModal = () => {
    const last = farms[farms.length - 1]
    const lastNum = parseInt(last?.id?.replace(/\D/g, '')) || farms.length
    const suggestedId = 'F' + (lastNum + 1)
    const suggestedHarvest = Math.min((last?.deadline ?? 10) + 1, 28)
    const suggestedDeadline = Math.min(suggestedHarvest + 10, 31)
    setNewFarmData({
      id: suggestedId,
      harvestDay: suggestedHarvest.toString(),
      deadline: suggestedDeadline.toString()
    })
    setShowAddModal(true)
  }

  const confirmAddFarm = () => {
    const { id, harvestDay, deadline } = newFarmData

    // Validate inputs
    if (!id || !id.trim()) {
      addToast('Farm ID is required', 'error')
      return
    }

    const harvest = parseInt(harvestDay)
    const dl = parseInt(deadline)

    if (isNaN(harvest) || harvest < 1 || harvest > 31) {
      addToast('Harvest day must be between 1 and 31', 'error')
      return
    }

    if (isNaN(dl) || dl < 1 || dl > 31) {
      addToast('Deadline must be between 1 and 31', 'error')
      return
    }

    if (dl <= harvest) {
      addToast('Deadline must be greater than harvest day', 'error')
      return
    }

    // Check for duplicate ID
    if (farms.some(f => f.id === id)) {
      addToast('Farm ID already exists', 'error')
      return
    }

    const window = dl - harvest
    setFarms([...farms, {
      id: id.trim(),
      harvestDay: harvest,
      deadline: dl,
      window: window,
      method: null
    }])

    addToast(`Farm ${id} added successfully`, 'success')
    setShowAddModal(false)
    setNewFarmData({ id: '', harvestDay: '', deadline: '' })
  }

  const cancelAddFarm = () => {
    setShowAddModal(false)
    setNewFarmData({ id: '', harvestDay: '', deadline: '' })
  }

  const removeFarm = (idx) => setFarms(farms.filter((_, i) => i !== idx))

  const updateFarm = (idx, field, val) => {
    const updated = farms.map((f, i) => {
      if (i !== idx) return f
      const newF = { ...f, [field]: field === 'id' ? val : (parseInt(val) || 0) }
      newF.window = newF.deadline - newF.harvestDay
      return newF
    })
    setFarms(updated)
  }

  const getMethodStyle = (method) => {
    if (!method) return 'text-slate-500'
    const styles = {
      BURNING: 'text-red-400 bg-red-500/10 border border-red-500/30',
      MULCHING: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30',
      BIO: 'text-blue-400 bg-blue-500/10 border border-blue-500/30',
      MANUAL: 'text-amber-400 bg-amber-500/10 border border-amber-500/30',
    }
    return styles[method] || ''
  }

  return (
    <div className="w-[460px] flex-shrink-0 flex flex-col
                    bg-[#0d0d24] border-r border-white/5 h-full overflow-hidden">

      {/* ── SECTION 1: Table ── */}
      <div className="flex-1 flex flex-col min-h-0 p-4">

        {/* Table header row */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Farm Data Input
          </h2>
          <div className="flex gap-2">
            <button onClick={openAddModal}
              className="px-3 py-1 text-xs font-bold rounded-md
                         bg-emerald-500/20 text-emerald-400
                         border border-emerald-500/30
                         hover:bg-emerald-500/30 transition-colors">
              + Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto rounded-lg
                        border border-white/8">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#161630]">
                {['Farm ID', 'Harvest', 'Deadline', 'Window', 'Method'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-bold
                                          text-slate-300 border-b border-white/10
                                          whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="px-2 py-2.5 border-b border-white/10 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm, idx) => (
                <tr key={farm.id}
                  className={`border-b border-white/5 transition-colors
                                ${idx % 2 === 0 ? 'bg-[#0f0f22]' : 'bg-[#111126]'}
                                hover:bg-indigo-500/5`}>
                  <td className="px-3 py-2 font-mono font-bold text-indigo-300">
                    <input type="text" value={farm.id}
                      onChange={e => updateFarm(idx, 'id', e.target.value)}
                      className="w-16 bg-transparent text-indigo-300
                                 font-mono font-bold focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={farm.harvestDay}
                      onChange={e => updateFarm(idx, 'harvestDay', e.target.value)}
                      className="w-12 bg-transparent text-slate-200
                                 focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={farm.deadline}
                      onChange={e => updateFarm(idx, 'deadline', e.target.value)}
                      className="w-12 bg-transparent text-slate-200
                                 focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-bold ${farm.window < 8 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {farm.window}d
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {farm.method ? (
                      <span className={`badge ${getMethodStyle(farm.method)}`}>
                        {METHODS[farm.method]?.short || farm.method}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <button onClick={() => removeFarm(idx)}
                      className="text-slate-600 hover:text-red-400
                                 transition-colors text-xs font-bold">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: Budget ── */}
      <div className="px-4 pb-3">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Government Subsidy Budget
            </span>
            <span className="text-lg font-black text-indigo-300">
              ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>
          <input type="range"
            min={5000} max={200000} step={1000}
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none
                       bg-slate-700 cursor-pointer mb-2" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>₹5,000</span>
            <span>₹2,00,000</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Buttons ── */}
      <div className="px-4 pb-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <AlgoButton
            label="▶ Run Greedy"
            colors="bg-amber-500 hover:bg-amber-400 text-black"
            onClick={() => onRun('greedy')} disabled={running} />
          <AlgoButton
            label="▶ Run DP"
            colors="bg-indigo-500 hover:bg-indigo-400 text-white"
            onClick={() => onRun('dp')} disabled={running} />
          <AlgoButton
            label="▶ Backtracking"
            colors="bg-red-500 hover:bg-red-400 text-white"
            onClick={() => onRun('backtrack')} disabled={running} />
          <AlgoButton
            label="▶ Run All"
            colors="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => onRun('all')} disabled={running} />
        </div>
        <AlgoButton
          label="📄 Export Report"
          colors="bg-teal-500 hover:bg-teal-400 text-white w-full"
          onClick={handleExport}
          disabled={running} />
        <div className="flex gap-2 w-full">
          <button onClick={handleExportConfig} className="bg-slate-600 hover:bg-slate-500 text-white text-xs w-full rounded-lg py-2 font-bold transition">
            📥 Export Config
          </button>
          <button onClick={() => fileRef.current?.click()} className="bg-slate-600 hover:bg-slate-500 text-white text-xs w-full rounded-lg py-2 font-bold transition">
            📤 Import Config
          </button>
          <input type="file" accept=".json" ref={fileRef} onChange={handleImportConfig} className="hidden" />
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div className="px-4 py-2.5 bg-[#080818] border-t border-white/5 flex-shrink-0">
        <p className="text-xs text-slate-400 truncate">{statusMsg}</p>
      </div>

      {/* ── ADD FARM MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16163a] border border-white/10 rounded-xl p-6 w-[400px] shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">Add New Farm</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Farm ID
                </label>
                <input
                  type="text"
                  value={newFarmData.id}
                  onChange={(e) => setNewFarmData({ ...newFarmData, id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0d24] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., F11"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Harvest Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newFarmData.harvestDay}
                  onChange={(e) => setNewFarmData({ ...newFarmData, harvestDay: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0d24] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., 15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Deadline (1-31, must be &#62; Harvest Day)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newFarmData.deadline}
                  onChange={(e) => setNewFarmData({ ...newFarmData, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0d24] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., 25"
                />
              </div>

              {newFarmData.harvestDay && newFarmData.deadline && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Window:</span>
                  <span className={`font-bold ${(parseInt(newFarmData.deadline) - parseInt(newFarmData.harvestDay)) < 8
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                    }`}>
                    {Math.max(0, parseInt(newFarmData.deadline) - parseInt(newFarmData.harvestDay))} days
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelAddFarm}
                className="flex-1 px-4 py-2 text-sm font-bold text-slate-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddFarm}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Add Farm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AlgoButton({ label, colors, onClick, disabled, extra = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${colors} ${extra}
                  disabled:opacity-40 disabled:cursor-not-allowed`}>
      {label}
    </button>
  )
}
