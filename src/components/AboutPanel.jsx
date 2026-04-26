import GrainLogo from './GrainLogo'

export default function AboutPanel() {
  return (
    <div className="h-full overflow-auto bg-[#080818]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <GrainLogo size={80} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Crop Stubble Burning Scheduler
          </h1>
          <p className="text-slate-400 text-base">
            Design & Analysis of Algorithms — Course Project
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="badge bg-indigo-500/20 text-indigo-300
                             border border-indigo-500/30 text-sm px-3 py-1">
              DAA Project
            </span>
            <span className="badge bg-emerald-500/20 text-emerald-300
                             border border-emerald-500/30 text-sm px-3 py-1">
              React + JavaScript
            </span>
          </div>
        </div>

        {/* Problem card */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-base font-black text-white mb-3 flex items-center gap-2">
            <span className="text-red-400">⚠️</span> The Real Problem
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every October, 10+ million farmers in Punjab and Haryana burn rice
            stubble to clear fields before wheat sowing. This causes Delhi's AQI
            to exceed 500 — dangerous for 30+ million people. The root cause:
            farmers have only 10–14 days between rice harvest and wheat sowing,
            and burning is the only free option. This tool uses DAA algorithms to
            optimally allocate government subsidies to minimize total burning.
          </p>
        </div>

        {/* Algorithm cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              name: 'Greedy', color: 'amber', complexity: 'O(n log n)',
              desc: 'Assigns cheapest non-burning method to the most time-constrained farm first. Fast but not always optimal.'
            },
            {
              name: 'Dynamic Programming', color: 'indigo', complexity: 'O(n × B)',
              desc: 'Builds a DP table across all farms and budget levels. Guarantees the mathematically minimum possible pollution.'
            },
            {
              name: 'Backtracking', color: 'purple', complexity: 'O(4ⁿ) pruned',
              desc: 'Explores all valid assignments recursively. Prunes paths that exceed budget or current best. Confirms DP optimality.'
            },
          ].map(({ name, color, complexity, desc }) => {
            const styles = {
              amber: 'border-amber-500/30 bg-amber-500/5 border-l-4 border-l-amber-500',
              indigo: 'border-indigo-500/30 bg-indigo-500/5 border-l-4 border-l-indigo-500',
              purple: 'border-purple-500/30 bg-purple-500/5 border-l-4 border-l-purple-500',
            }
            const textColors = {
              amber: 'text-amber-400',
              indigo: 'text-indigo-400',
              purple: 'text-purple-400',
            }
            return (
              <div key={name} className={`rounded-xl border p-4 ${styles[color]}`}>
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${textColors[color]}`}>
                  {name}
                </p>
                <p className="font-mono text-white text-sm font-bold mb-2">
                  {complexity}
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>

        <p className="text-center text-slate-600 text-xs">
          Built with React • Recharts • Vite • Tailwind CSS
        </p>
      </div>
    </div>
  )
}
