# C Implementations of Crop Stubble Management Algorithms

This directory contains C implementations of the three optimization algorithms used in the Crop Stubble Burning Scheduler project.

## Files

| File | Description |
|------|-------------|
| `greedy.c` | Greedy algorithm - fast heuristic, O(n log n) |
| `dynamic_programming.c` | DP algorithm - optimal solution, O(n × B) |
| `backtracking.c` | Backtracking with pruning - optimal, O(4^n) worst case |
| `Makefile` | Build configuration |

## Compilation

### Compile all algorithms:
```bash
make all
```

### Compile individual algorithms:
```bash
make greedy
make dp
make backtrack
```

## Running

### Greedy Algorithm:
```bash
./greedy
```

### Dynamic Programming:
```bash
./dp
```

### Backtracking:
```bash
./backtrack
```

## Algorithm Details

### 1. Greedy Algorithm (`greedy.c`)

**Approach:**
- Sort farms by window size (most urgent first)
- For each farm, try methods in priority order: BIO → MANUAL → MULCHING → BURNING
- Pick the first method that fits within window and budget

**Time Complexity:** O(n log n)
**Space Complexity:** O(n)
**Optimal:** No (but fast)

### 2. Dynamic Programming (`dynamic_programming.c`)

**Approach:**
- 0/1 Knapsack variant
- DP table: `dp[i][b]` = minimum pollution for first i farms with budget b
- Backtrack to find optimal assignments

**Time Complexity:** O(n × B) where B = budget/1000
**Space Complexity:** O(n × B)
**Optimal:** Yes (guaranteed minimum pollution)

### 3. Backtracking (`backtracking.c`)

**Approach:**
- Branch and Bound technique
- Explore all possible assignments recursively
- Prune branches when:
  - Current pollution ≥ best found
  - Method doesn't fit window
  - Budget exceeded

**Time Complexity:** O(4^n) worst case, heavily pruned in practice
**Space Complexity:** O(n) for recursion stack
**Optimal:** Yes (guaranteed minimum pollution)

## Method Properties

| Method | Days | Cost (₹) | Pollution | Priority |
|--------|------|----------|-----------|----------|
| Bio-Decomposer | 7 | 500 | 5 | 1st (Greedy) |
| Manual Removal | 5 | 1,500 | 10 | 2nd (Greedy) |
| Machine Mulching | 3 | 3,000 | 0 | 3rd (Greedy) |
| Burning | 1 | 0 | 100 | Fallback |

## Sample Input

All programs use the same 10 farms with budget ₹50,000:

| Farm | Harvest Day | Deadline | Window |
|------|-------------|----------|--------|
| F1 | 8 | 18 | 10 |
| F2 | 10 | 24 | 14 |
| F3 | 12 | 22 | 10 |
| F4 | 9 | 19 | 10 |
| F5 | 15 | 28 | 13 |
| F6 | 11 | 18 | 7 |
| F7 | 7 | 21 | 14 |
| F8 | 13 | 23 | 10 |
| F9 | 10 | 17 | 7 |
| F10 | 14 | 27 | 13 |

## Expected Output

All three algorithms should produce similar (DP and Backtracking should produce identical optimal) results:
- Total pollution: ~50-150 units (depending on budget)
- Most farms assigned to eco-friendly methods (BIO, MULCHING, MANUAL)
- Only farms with very tight windows assigned to BURNING