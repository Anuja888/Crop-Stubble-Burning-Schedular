import { useRef, useEffect, useState } from 'react'
import { METHODS } from '../constants'

const LEFT = 70, RIGHT = 20, TOP = 72, ROW_H = 50, BAR_H = 28, BOT = 60

export default function GanttChart({ result }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(800)

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width)
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const farms = result?.farms || []
  const n = farms.length || 10
  const svgH = TOP + n * ROW_H + BOT
  const dayW = (width - LEFT - RIGHT) / 30

  const dateLabels = [1, 6, 11, 16, 21, 26, 31]

  return (
    <div ref={containerRef}
      className="flex-1 bg-[#080818] overflow-auto relative">

      {/* Title bar */}
      <div className="flex items-start justify-between px-4 pt-3 pb-1 border-b border-white/5 sticky top-0 z-20 bg-[#080818]">
        <div>
          <h3 className="text-sm font-black text-white">
            Clearance Schedule — Gantt Chart
          </h3>
          {result && (
            <p className="text-xs text-slate-400 mt-0.5">
              {result.algorithmName} •
              <span className={result.totalPollution === 0 ? 'text-emerald-400' : result.totalPollution < 100 ? 'text-amber-400' : 'text-red-400'}>
                {' '}{result.totalPollution} pollution units
              </span>
              {' '}• ₹{result.totalCost.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        {result && (
          <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">
            {result.algorithmName}
          </span>
        )}
      </div>

      {!result ? (
        // Empty state
        <div className="flex flex-col items-center justify-center h-[calc(100%-60px)]
                        text-slate-600">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-base font-semibold">No schedule yet</p>
          <p className="text-sm mt-1">Run an algorithm to see the Gantt chart</p>
        </div>
      ) : (
        <svg width={width} height={svgH}
          className="font-sans" style={{ fontFamily: 'Segoe UI,system-ui,sans-serif' }}>

          {/* Row backgrounds */}
          {farms.map((_, i) => (
            <rect key={i}
              x={0} y={TOP + i * ROW_H}
              width={width} height={ROW_H}
              fill={i % 2 === 0 ? '#0c0c1e' : '#0f0f24'} />
          ))}

          {/* Vertical grid lines */}
          {Array.from({ length: 31 }, (_, d) => {
            const x = LEFT + d * dayW
            const major = d === 0 || d % 5 === 0
            return (
              <line key={d} x1={x} y1={TOP} x2={x} y2={TOP + n * ROW_H}
                stroke={major ? '#2d3a6e' : '#1a2040'}
                strokeWidth={major ? 1 : 0.5} />
            )
          })}

          {/* Date labels + ticks */}
          {dateLabels.map(day => {
            const x = LEFT + (day - 1) * dayW
            return (
              <g key={day}>
                <text x={x} y={TOP - 12} textAnchor="middle"
                  fill="#64748b" fontSize={10} fontWeight="500">
                  Oct {day}
                </text>
                <line x1={x} y1={TOP - 4} x2={x} y2={TOP}
                  stroke="#6366f1" strokeWidth={1.5} />
              </g>
            )
          })}

          {/* Farm rows */}
          {farms.map((farm, i) => {
            const m = farm.method ? METHODS[farm.method] : null
            const barX = LEFT + (farm.harvestDay - 1) * dayW
            const barW = m ? Math.max(m.days * dayW, 24) : 0
            const barY = TOP + i * ROW_H + (ROW_H - BAR_H) / 2
            const dlX = LEFT + (farm.deadline - 1) * dayW

            return (
              <g key={farm.id}>
                {/* Farm label */}
                <text
                  x={LEFT - 8} y={TOP + i * ROW_H + ROW_H / 2 + 4}
                  textAnchor="end" fill="#94a3b8"
                  fontSize={11} fontWeight="700">
                  {farm.id}
                </text>

                {/* Bar */}
                {m && (
                  <>
                    {/* Bar shadow */}
                    <rect x={barX + 2} y={barY + 2}
                      width={barW} height={BAR_H} rx={6}
                      fill="rgba(0,0,0,0.4)" />
                    {/* Bar body */}
                    <rect x={barX} y={barY}
                      width={barW} height={BAR_H} rx={6}
                      fill={m.color} opacity={0.85} />
                    {/* Highlight shine */}
                    <rect x={barX + 2} y={barY + 2}
                      width={barW - 4} height={BAR_H / 2 - 2} rx={4}
                      fill="rgba(255,255,255,0.15)" />
                    {/* Label */}
                    {barW > 32 && (
                      <text
                        x={barX + barW / 2} y={barY + BAR_H / 2 + 4}
                        textAnchor="middle" fill="white"
                        fontSize={10} fontWeight="800">
                        {m.short}
                      </text>
                    )}
                  </>
                )}

                {/* Deadline marker */}
                <line x1={dlX} y1={TOP + i * ROW_H + 4}
                  x2={dlX} y2={TOP + (i + 1) * ROW_H - 4}
                  stroke="#ef4444" strokeWidth={1.5}
                  strokeDasharray="4 3" opacity={0.7} />

              </g>
            )
          })}

          {/* Bottom legend */}
          {[
            ['Burning', '#ef4444', '100 pollution'],
            ['Mulching', '#10b981', '0 pollution'],
            ['Bio-Decomp', '#3b82f6', '5 pollution'],
            ['Manual', '#f59e0b', '10 pollution'],
          ].map(([name, color, desc], i) => (
            <g key={name} transform={`translate(${LEFT + i * 170}, ${TOP + n * ROW_H + 18})`}>
              <rect width={12} height={12} rx={3} fill={color} opacity={0.8} />
              <text x={17} y={10} fill="#94a3b8" fontSize={10} fontWeight="600">
                {name}
              </text>
              <text x={17} y={22} fill="#475569" fontSize={9}>
                {desc}
              </text>
            </g>
          ))}

        </svg>
      )}
    </div>
  )
}
