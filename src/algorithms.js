import { METHODS } from "./constants";

export function runGreedy(farmsInput, budget) {
  const start = performance.now();
  const farms = farmsInput.map(f => ({...f, window: f.deadline - f.harvestDay}));

  // Sort by window ascending (most urgent first)
  farms.sort((a, b) => a.window - b.window);

  let budgetLeft = budget;
  const priority = ["BIO", "MANUAL", "MULCHING", "BURNING"];
  const trace = [];

  for (const farm of farms) {
    trace.push(`Farm ${farm.id} window=${farm.window} risk=${farm.window <= 3 ? 'HIGH' : farm.window <= 7 ? 'MED' : 'LOW'}`);
    let chosen = null;
    for (const key of priority) {
      const m = METHODS[key];
      trace.push(`Try ${key} (days=${m.days}, cost=₹${m.cost}) → deadline=${m.days <= farm.window}, budget=${budgetLeft >= m.cost}`);
      if (m.days <= farm.window && budgetLeft >= m.cost) {
        chosen = key;
        break;
      }
    }
    if (chosen) {
      trace.push(`Selected ${chosen} for ${farm.id}`);
      farm.method = chosen;
      budgetLeft -= METHODS[chosen].cost;
    } else {
      trace.push(`FALLBACK: Burning assigned to ${farm.id}`);
      farm.method = "BURNING";
      budgetLeft -= METHODS["BURNING"].cost;
    }
  }

  // Sort back to original order
  farms.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

  const totalPollution = farms.reduce((s,f) => s + METHODS[f.method].pollution, 0);
  const totalCost = farms.reduce((s,f) => s + METHODS[f.method].cost, 0);

  return {
    farms,
    totalPollution,
    totalCost,
    timeMs: Math.round(performance.now() - start),
    algorithmName: "Greedy",
    stepTrace: trace
  };
}

export function runDP(farmsInput, budget) {
  const start = performance.now();
  const farms = farmsInput.map(f => ({...f, window: f.deadline - f.harvestDay}));
  const n = farms.length;
  const B = Math.min(budget, 100000);
  const INF = 999999;
  const methodKeys = Object.keys(METHODS);
  const trace = [];

  // dp[i][b] = min pollution for first i farms spending b
  const dp = Array.from({length: n+1}, () => new Array(B+1).fill(INF));
  const choice = Array.from({length: n+1}, () => new Array(B+1).fill("BURNING"));
  dp[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    const farm = farms[i-1];
    trace.push(`Computed DP row for farm ${farm.id} window=${farm.window}`);
    for (let b = 0; b <= B; b++) {
      dp[i][b] = INF;
      for (const key of methodKeys) {
        const m = METHODS[key];
        if (m.days > farm.window) continue;
        if (b < m.cost) continue;
        if (dp[i-1][b - m.cost] === INF) continue;
        const newPoll = dp[i-1][b - m.cost] + m.pollution;
        if (newPoll < dp[i][b]) {
          dp[i][b] = newPoll;
          choice[i][b] = key;
        }
      }
      // fallback to burning if nothing worked
      if (dp[i][b] === INF && dp[i-1][b] !== INF &&
          METHODS["BURNING"].days <= farm.window) {
        dp[i][b] = dp[i-1][b] + METHODS["BURNING"].pollution;
        choice[i][b] = "BURNING";
      }
    }
  }

  // Find best budget
  let bestPoll = INF, bestB = 0;
  for (let b = 0; b <= B; b++) {
    if (dp[n][b] < bestPoll) { bestPoll = dp[n][b]; bestB = b; }
  }

  // Traceback
  let b = bestB;
  for (let i = n; i >= 1; i--) {
    const key = choice[i][b];
    trace.push(`Backtrack: select ${key} for ${farms[i-1].id} remaining=₹${b}`);
    farms[i-1].method = key;
    b -= METHODS[key].cost;
  }

  farms.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));
  const totalPollution = farms.reduce((s,f) => s + METHODS[f.method].pollution, 0);
  const totalCost = farms.reduce((s,f) => s + METHODS[f.method].cost, 0);

  return {
    farms,
    totalPollution,
    totalCost,
    timeMs: Math.round(performance.now() - start),
    algorithmName: "Dynamic Programming",
    stepTrace: trace
  };
}

export function runBacktracking(farmsInput, budget) {
  const start = performance.now();
  const farms = farmsInput.map(f => ({...f, window: f.deadline - f.harvestDay}));
  const n = farms.length;
  const methodKeys = Object.keys(METHODS);
  const trace = [];

  let bestPollution = Infinity;
  let bestAssignment = new Array(n).fill("BURNING");
  let nodesExplored = 0;
  let nodesPruned = 0;

  function backtrack(idx, budgetLeft, currPoll, curr) {
    if (idx === n) {
      if (currPoll < bestPollution) {
        trace.push(`SUCCESS: full assignment pollution=${currPoll}`);
        bestPollution = currPoll;
        bestAssignment = [...curr];
      }
      return;
    }
    const farm = farms[idx];
    if (currPoll >= bestPollution) {
      trace.push(`PRUNE: ${farm.id} method=${curr[idx-1] || 'none'} pollution ceiling hit`);
      nodesPruned++;
      return;
    }
    
    for (const key of methodKeys) {
      const m = METHODS[key];
      trace.push(`DECISION: farm=${farm.id} try=${key} remaining=₹${budgetLeft}`);
      if (m.days > farm.window) {
        trace.push(`PRUNE: ${farm.id} method=${key} deadline violated`);
        continue;
      }
      if (budgetLeft < m.cost) {
        trace.push(`PRUNE: ${farm.id} method=${key} budget exceeded`);
        continue;
      }
      nodesExplored++;
      curr[idx] = key;
      backtrack(idx+1, budgetLeft - m.cost,
                currPoll + m.pollution, curr);
    }
  }

  backtrack(0, budget, 0, new Array(n).fill("BURNING"));

  farms.forEach((f, i) => f.method = bestAssignment[i]);
  farms.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

  const totalPollution = farms.reduce((s,f) => s + METHODS[f.method].pollution, 0);
  const totalCost = farms.reduce((s,f) => s + METHODS[f.method].cost, 0);

  return {
    farms, totalPollution, totalCost,
    timeMs: Math.round(performance.now() - start),
    algorithmName: "Backtracking",
    nodesExplored, nodesPruned,
    stepTrace: trace
  };
}
