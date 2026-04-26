import { METHODS } from "./constants";

export function generateReport(greedyResult, dpResult, backtrackResult, budget) {
  const lines = [];
  lines.push("===================================================");
  lines.push("CROP STUBBLE BURNING SCHEDULER — SCHEDULE REPORT");
  lines.push("Generated: " + new Date().toLocaleString());
  lines.push("===================================================");
   lines.push("");
  lines.push("GOVERNMENT BUDGET: ₹" + budget);
  const n = greedyResult.farms.length;
  lines.push("TOTAL FARMS: " + n);
  lines.push("");

  const baseline = n * 100;

  const appendAlgoSection = (result, title, isBacktrack = false) => {
    lines.push("---------------------------------------------------");
    lines.push(`SECTION: ${title}`);
    lines.push("---------------------------------------------------");
    lines.push(`Total Pollution Reduced: ${baseline - result.totalPollution} units`);
    lines.push(`Total Cost: ₹${result.totalCost}`);
    lines.push(`Budget Used: ${((result.totalCost * 100) / budget).toFixed(2)}%`);
    lines.push(`Execution Time: ${result.timeMs === 0 ? "<1" : result.timeMs} ms`);
    if (isBacktrack) {
      lines.push(`Nodes Explored: ${result.nodesExplored}`);
      lines.push(`Nodes Pruned: ${result.nodesPruned}`);
      const t = result.nodesExplored + result.nodesPruned;
      lines.push(`Pruning Efficiency: ${t === 0 ? 0 : ((result.nodesPruned * 100.0) / t).toFixed(2)}%`);
    }
    lines.push("");
    lines.push("FARM-WISE SCHEDULE:");
    lines.push("Farm   | Method             | Start Date | End Date   | Cost    | Pollution ");
    lines.push("-------------------------------------------------------------------------");
    
    let sumCost = 0, sumPoll = 0;
    result.farms.forEach((f) => {
      const m = METHODS[f.method];
      if(!m) return;
      const endy = parseInt(f.harvestDay) + m.days - 1;
      lines.push(`${f.id.padEnd(6, ' ')} | ${m.name.padEnd(18, ' ')} | Oct ${String(f.harvestDay).padEnd(6, ' ')} | Oct ${String(endy).padEnd(6, ' ')} | ₹${String(m.cost).padEnd(6, ' ')} | ${m.pollution} units`);
      sumCost += m.cost;
      sumPoll += m.pollution;
    });
    lines.push("");
    lines.push(`TOTAL:                      ₹${String(sumCost).padEnd(6, ' ')} | ${sumPoll} units`);
    lines.push("");
  };

  appendAlgoSection(greedyResult, "1: GREEDY ALGORITHM RESULTS");
  appendAlgoSection(dpResult, "2: DP OPTIMAL RESULTS");
  
  const saved = greedyResult.totalPollution - dpResult.totalPollution;
  lines.push("IMPROVEMENT OVER GREEDY:");
  lines.push(`Pollution saved: ${saved} units (${saved === 0 ? "0.0" : ((saved * 100.0) / greedyResult.totalPollution).toFixed(1)}% better)`);
  lines.push(`Cost difference: ₹${dpResult.totalCost - greedyResult.totalCost}`);
  lines.push("");

  appendAlgoSection(backtrackResult, "3: BACKTRACKING RESULTS", true);

  lines.push("---------------------------------------------------");
  lines.push("SECTION 4: COMPARISON SUMMARY");
  lines.push("---------------------------------------------------");
  lines.push("Metric             | Baseline   | Greedy     | DP         | Backtrack  ");
  lines.push("-------------------|------------|------------|------------|------------");
  lines.push(`Total Pollution    | ${String(baseline).padEnd(10, ' ')} | ${String(greedyResult.totalPollution).padEnd(10, ' ')} | ${String(dpResult.totalPollution).padEnd(10, ' ')} | ${String(backtrackResult.totalPollution).padEnd(10, ' ')}`);
  lines.push(`Total Cost (₹)     | 0          | ${String(greedyResult.totalCost).padEnd(10, ' ')} | ${String(dpResult.totalCost).padEnd(10, ' ')} | ${String(backtrackResult.totalCost).padEnd(10, ' ')}`);
  
  const bG = greedyResult.farms.filter(f => f.method === "BURNING").length;
  const bD = dpResult.farms.filter(f => f.method === "BURNING").length;
  const bB = backtrackResult.farms.filter(f => f.method === "BURNING").length;
  
  lines.push(`Farms Burning      | ALL        | ${String(bG).padEnd(10, ' ')} | ${String(bD).padEnd(10, ' ')} | ${String(bB).padEnd(10, ' ')}`);
  lines.push(`Time (ms)          | N/A        | ${String(greedyResult.timeMs).padEnd(10, ' ')} | ${String(dpResult.timeMs).padEnd(10, ' ')} | ${String(backtrackResult.timeMs).padEnd(10, ' ')}`);
  lines.push("");

  lines.push("---------------------------------------------------");
  lines.push("SECTION 5: ALGORITHM COMPLEXITY");
  lines.push("---------------------------------------------------");
  lines.push("Brute Force:   O(4^n) — Not feasible for n > 15");
  lines.push("Greedy:        O(n log n) — Fast, suboptimal");
  lines.push("Dynamic Prog:  O(n × B) — Optimal, efficient");
  lines.push("Backtracking:  O(4^n) worst, pruned in practice");
  lines.push("");

  lines.push("---------------------------------------------------");
  lines.push("SECTION 6: RECOMMENDATIONS");
  lines.push("---------------------------------------------------");
  let bioC = 0, mulchC = 0, manC = 0, burnC = 0;
  dpResult.farms.forEach(f => {
    if(f.method==="BIO") bioC++;
    if(f.method==="MULCHING") mulchC++;
    if(f.method==="MANUAL") manC++;
    if(f.method==="BURNING") burnC++;
  });
  
  const rem = budget - dpResult.totalCost;
  const pSaved = baseline - dpResult.totalPollution;
  const aqi = pSaved * 0.5;

  lines.push(`Based on the DP optimal solution with budget ₹${budget}:`);
  lines.push(` - ${bioC} farms use Bio-Decomposer (₹500 each, low pollution)`);
  lines.push(` - ${mulchC} farms use Machine Mulching (₹3000 each, zero pollution)`);
  lines.push(` - ${manC} farms use Manual Removal (₹1500 each)`);
  lines.push(` - ${burnC} farms still burning` + (burnC > 0 ? ` ← increase budget by ₹${burnC*500} to eliminate these` : ` ✓ No farms burning!`));
  lines.push(` - Budget remaining: ₹${rem}`);
  lines.push(` - Pollution reduced vs baseline: ${pSaved} units (${((pSaved*100)/baseline).toFixed(1)}%)`);
  lines.push(` - Estimated AQI improvement: ${aqi.toFixed(1)} index points`);
  lines.push("");
  lines.push("===================================================");
  lines.push("END OF REPORT");
  lines.push("===================================================");

  const blob = new Blob(["\uFEFF" + lines.join('\n')], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stubble_burning_report.txt';
  a.click();
  URL.revokeObjectURL(url);
}
