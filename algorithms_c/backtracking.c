/**
 * Backtracking Algorithm with Pruning for Crop Stubble Management Optimization
 * 
 * Approach: Branch and Bound technique
 * - Explore all possible method assignments recursively
 * - Build a decision tree where each level = one farm, each branch = one method
 * - PRUNE branches when:
 *   1. Current pollution >= best found so far (optimality pruning)
 *   2. Method doesn't fit within the farm's window (feasibility pruning)
 *   3. Budget exceeded (constraint pruning)
 * 
 * Time Complexity: O(4^n) worst case (no pruning), but heavily pruned in practice
 * Space Complexity: O(n) for recursion stack
 * 
 * Guarantees OPTIMAL solution like DP, but uses less memory for large budgets.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <limits.h>

#define MAX_FARMS 100
#define NUM_METHODS 4

// Method types
typedef enum {
    BIO = 0,
    MANUAL = 1,
    MULCHING = 2,
    BURNING = 3
} MethodType;

// Method properties
typedef struct {
    const char* name;
    int days;
    int cost;
    int pollution;
    const char* color;
    const char* shortName;
} Method;

// Farm structure
typedef struct {
    char id[10];
    int harvestDay;
    int deadline;
    int window;
    MethodType assignedMethod;
} Farm;

// Global variables for backtracking statistics
typedef struct {
    int nodesExplored;
    int nodesPruned;
    int maxDepth;
} BacktrackStats;

// Method definitions (matching constants.js)
Method methods[NUM_METHODS] = {
    {"Bio-Decomposer", 7, 500, 5, "#3b82f6", "BIO"},
    {"Manual Removal", 5, 1500, 10, "#f59e0b", "MAN"},
    {"Machine Mulching", 3, 3000, 0, "#10b981", "MULCH"},
    {"Burning", 1, 0, 100, "#ef4444", "BURN"}
};

MethodType methodKeys[NUM_METHODS] = {BIO, MANUAL, MULCHING, BURNING};

// Compare function for sorting farms by ID
int compareById(const void* a, const void* b) {
    Farm* farmA = (Farm*)a;
    Farm* farmB = (Farm*)b;
    int numA = atoi(farmA->id + 1);
    int numB = atoi(farmB->id + 1);
    return numA - numB;
}

// Get risk level based on window
const char* getRiskLevel(int window) {
    if (window <= 3) return "HIGH";
    if (window <= 7) return "MED";
    return "LOW";
}

/**
 * Recursive backtracking function with pruning
 * 
 * @param farms Array of farms
 * @param n Total number of farms
 * @param idx Current farm index being processed
 * @param budgetLeft Remaining budget
 * @param currPollution Current total pollution
 * @param currAssignment Current method assignments
 * @param bestPollution Pointer to best pollution found so far
 * @param bestAssignment Pointer to best assignment found so far
 * @param stats Statistics tracking
 */
void backtrack(Farm* farms, int n, int idx, int budgetLeft, int currPollution,
               MethodType* currAssignment, int* bestPollution, 
               MethodType* bestAssignment, BacktrackStats* stats) {
    
    // Base case: all farms assigned
    if (idx == n) {
        if (currPollution < *bestPollution) {
            *bestPollution = currPollution;
            memcpy(bestAssignment, currAssignment, n * sizeof(MethodType));
            printf("  ✓ SUCCESS: Full assignment, pollution=%d\n", currPollution);
        }
        return;
    }
    
    Farm* farm = &farms[idx];
    
    // Pruning: if current pollution already >= best, no point continuing
    if (currPollution >= *bestPollution) {
        stats->nodesPruned++;
        printf("  ✗ PRUNE: %s - pollution ceiling hit (curr=%d >= best=%d)\n",
               farm->id, currPollution, *bestPollution);
        return;
    }
    
    // Update max depth reached
    if (idx > stats->maxDepth) {
        stats->maxDepth = idx;
    }
    
    // Try each method for current farm
    for (int j = 0; j < NUM_METHODS; j++) {
        MethodType mType = methodKeys[j];
        Method* m = &methods[mType];
        
        printf("  DECISION: Farm %s (window=%d, risk=%s) try %s "
               "(days=%d, cost=₹%d, pollution=%d) remaining=₹%d\n",
               farm->id, farm->window, getRiskLevel(farm->window),
               m->name, m->days, m->cost, m->pollution, budgetLeft);
        
        // Pruning: Check if method fits within window
        if (m->days > farm->window) {
            stats->nodesPruned++;
            printf("    ✗ PRUNE: %s → %s - deadline violated (needs %d days, has %d)\n",
                   farm->id, m->name, m->days, farm->window);
            continue;
        }
        
        // Pruning: Check if budget allows this method
        if (budgetLeft < m->cost) {
            stats->nodesPruned++;
            printf("    ✗ PRUNE: %s → %s - budget exceeded (needs ₹%d, has ₹%d)\n",
                   farm->id, m->name, m->cost, budgetLeft);
            continue;
        }
        
        // Optimality pruning: check if adding this method's pollution would exceed best
        if (currPollution + m->pollution >= *bestPollution) {
            stats->nodesPruned++;
            printf("    ✗ PRUNE: %s → %s - would exceed best pollution\n",
                   farm->id, m->name);
            continue;
        }
        
        // Make the assignment and recurse
        stats->nodesExplored++;
        currAssignment[idx] = mType;
        
        printf("    → Exploring %s → %s...\n", farm->id, m->name);
        
        backtrack(farms, n, idx + 1, 
                  budgetLeft - m->cost,
                  currPollution + m->pollution,
                  currAssignment, bestPollution, bestAssignment, stats);
    }
}

// Run Backtracking Algorithm
void runBacktracking(Farm* farms, int n, int budget) {
    clock_t start = clock();
    
    // Calculate windows
    for (int i = 0; i < n; i++) {
        farms[i].window = farms[i].deadline - farms[i].harvestDay;
    }
    
    printf("\n=== BACKTRACKING ALGORITHM ===\n\n");
    printf("Farms: %d, Budget: ₹%d\n\n", n, budget);
    
    // Initialize
    int bestPollution = INT_MAX;
    MethodType* currAssignment = (MethodType*)malloc(n * sizeof(MethodType));
    MethodType* bestAssignment = (MethodType*)malloc(n * sizeof(MethodType));
    BacktrackStats stats = {0, 0, 0};
    
    // Initialize assignments to burning (fallback)
    for (int i = 0; i < n; i++) {
        currAssignment[i] = BURNING;
        bestAssignment[i] = BURNING;
    }
    
    // Start backtracking
    printf("Starting branch-and-bound search...\n\n");
    backtrack(farms, n, 0, budget, 0, currAssignment, 
              &bestPollution, bestAssignment, &stats);
    
    // Apply best assignment to farms
    for (int i = 0; i < n; i++) {
        farms[i].assignedMethod = bestAssignment[i];
    }
    
    // Sort back to original order
    qsort(farms, n, sizeof(Farm), compareById);
    
    // Calculate totals
    int totalPollution = 0;
    int totalCost = 0;
    for (int i = 0; i < n; i++) {
        totalPollution += methods[farms[i].assignedMethod].pollution;
        totalCost += methods[farms[i].assignedMethod].cost;
    }
    
    double timeMs = (double)(clock() - start) * 1000.0 / CLOCKS_PER_SEC;
    
    // Print statistics
    printf("\n--- BACKTRACKING STATISTICS ---\n");
    printf("Nodes Explored: %d\n", stats.nodesExplored);
    printf("Nodes Pruned: %d\n", stats.nodesPruned);
    printf("Max Depth Reached: %d\n", stats.maxDepth);
    double pruneRate = (stats.nodesExplored + stats.nodesPruned) > 0 ? 
        (double)stats.nodesPruned / (stats.nodesExplored + stats.nodesPruned) * 100 : 0;
    printf("Pruning Rate: %.1f%%\n", pruneRate);
    
    printf("\n--- BACKTRACKING RESULTS ---\n");
    printf("Total Pollution: %d units\n", totalPollution);
    printf("Total Cost: ₹%d\n", totalCost);
    printf("Time: %.3f ms\n", timeMs);
    printf("\nFinal Assignments:\n");
    for (int i = 0; i < n; i++) {
        printf("  %s → %s (window=%d, pollution=%d, cost=₹%d)\n",
               farms[i].id,
               methods[farms[i].assignedMethod].name,
               farms[i].window,
               methods[farms[i].assignedMethod].pollution,
               methods[farms[i].assignedMethod].cost);
    }
    
    free(currAssignment);
    free(bestAssignment);
}

// Main function with sample data
int main() {
    Farm farms[] = {
        {"F1", 8, 18, 0, -1},
        {"F2", 10, 24, 0, -1},
        {"F3", 12, 22, 0, -1},
        {"F4", 9, 19, 0, -1},
        {"F5", 15, 28, 0, -1},
        {"F6", 11, 18, 0, -1},
        {"F7", 7, 21, 0, -1},
        {"F8", 13, 23, 0, -1},
        {"F9", 10, 17, 0, -1},
        {"F10", 14, 27, 0, -1}
    };
    
    int n = sizeof(farms) / sizeof(farms[0]);
    int budget = 50000;
    
    printf("Crop Stubble Management - Backtracking with Pruning\n");
    printf("====================================================\n");
    printf("Number of farms: %d\n", n);
    printf("Budget: ₹%d\n\n", budget);
    
    runBacktracking(farms, n, budget);
    
    return 0;
}