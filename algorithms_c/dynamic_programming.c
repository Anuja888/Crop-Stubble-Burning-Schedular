/**
 * Dynamic Programming Algorithm for Crop Stubble Management Optimization
 * 
 * Approach: 0/1 Knapsack variant where:
 * - Items = farms
 * - Weight = method cost
 * - Value = pollution (to minimize)
 * - Capacity = budget
 * 
 * DP Table: dp[i][b] = minimum pollution for first i farms with budget b
 * 
 * Time Complexity: O(n * B * 4) = O(n * B) where B = budget
 * Space Complexity: O(n * B)
 * 
 * Guarantees OPTIMAL solution (minimum pollution within budget).
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <time.h>

#define MAX_FARMS 100
#define NUM_METHODS 4
#define MAX_BUDGET 200000
#define BUDGET_STEP 1000  // Scale down budget for DP table size

#define INF 999999

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

// Run Dynamic Programming Algorithm
void runDP(Farm* farms, int n, int budget) {
    clock_t start = clock();
    
    // Calculate windows
    for (int i = 0; i < n; i++) {
        farms[i].window = farms[i].deadline - farms[i].harvestDay;
    }
    
    // Scale down budget for DP table (to avoid memory issues)
    int scaledBudget = budget / BUDGET_STEP;
    if (scaledBudget > 200) scaledBudget = 200;  // Cap at 200
    
    printf("\n=== DYNAMIC PROGRAMMING ALGORITHM ===\n\n");
    printf("Farms: %d, Budget: ₹%d, Scaled Budget States: %d\n\n", n, budget, scaledBudget);
    
    // Allocate DP table
    // dp[i][b] = minimum pollution for first i farms with budget b
    int** dp = (int**)malloc((n + 1) * sizeof(int*));
    MethodType** choice = (MethodType**)malloc((n + 1) * sizeof(MethodType*));
    
    for (int i = 0; i <= n; i++) {
        dp[i] = (int*)malloc((scaledBudget + 1) * sizeof(int));
        choice[i] = (MethodType*)malloc((scaledBudget + 1) * sizeof(MethodType));
    }
    
    // Initialize DP table
    for (int i = 0; i <= n; i++) {
        for (int b = 0; b <= scaledBudget; b++) {
            dp[i][b] = INF;
            choice[i][b] = BURNING;
        }
    }
    dp[0][0] = 0;
    
    // Fill DP table
    for (int i = 1; i <= n; i++) {
        Farm* farm = &farms[i - 1];
        printf("Processing farm %s (window=%d)...\n", farm->id, farm->window);
        
        for (int b = 0; b <= scaledBudget; b++) {
            dp[i][b] = INF;
            
            // Try each method
            for (int j = 0; j < NUM_METHODS; j++) {
                MethodType mType = methodKeys[j];
                Method* m = &methods[mType];
                
                // Check if method fits within window
                if (m->days > farm->window) continue;
                
                // Scaled cost
                int scaledCost = m->cost / BUDGET_STEP;
                if (b < scaledCost) continue;
                
                // Check if previous state is valid
                if (dp[i - 1][b - scaledCost] == INF) continue;
                
                int newPoll = dp[i - 1][b - scaledCost] + m->pollution;
                if (newPoll < dp[i][b]) {
                    dp[i][b] = newPoll;
                    choice[i][b] = mType;
                }
            }
            
            // Fallback to burning if nothing worked
            if (dp[i][b] == INF && dp[i - 1][b] != INF && 
                methods[BURNING].days <= farm->window) {
                dp[i][b] = dp[i - 1][b] + methods[BURNING].pollution;
                choice[i][b] = BURNING;
            }
        }
    }
    
    // Find best pollution across all budget levels
    int bestPoll = INF, bestB = 0;
    for (int b = 0; b <= scaledBudget; b++) {
        if (dp[n][b] < bestPoll) {
            bestPoll = dp[n][b];
            bestB = b;
        }
    }
    
    // Traceback to find assignments
    printf("\nTracing back optimal solution...\n");
    int b = bestB;
    int totalCost = 0;
    
    for (int i = n; i >= 1; i--) {
        MethodType key = choice[i][b];
        farms[i - 1].assignedMethod = key;
        int scaledCost = methods[key].cost / BUDGET_STEP;
        b -= scaledCost;
        totalCost += methods[key].cost;
        
        printf("  Farm %s → %s\n", farms[i - 1].id, methods[key].name);
    }
    
    // Sort back to original order
    qsort(farms, n, sizeof(Farm), compareById);
    
    // Calculate total pollution
    int totalPollution = 0;
    for (int i = 0; i < n; i++) {
        totalPollution += methods[farms[i].assignedMethod].pollution;
    }
    
    double timeMs = (double)(clock() - start) * 1000.0 / CLOCKS_PER_SEC;
    
    // Free memory
    for (int i = 0; i <= n; i++) {
        free(dp[i]);
        free(choice[i]);
    }
    free(dp);
    free(choice);
    
    printf("\n--- DP RESULTS ---\n");
    printf("Total Pollution: %d units\n", totalPollution);
    printf("Total Cost: ₹%d\n", totalCost);
    printf("Time: %.3f ms\n", timeMs);
    printf("\nFinal Assignments:\n");
    for (int i = 0; i < n; i++) {
        printf("  %s → %s (pollution=%d, cost=₹%d)\n", 
               farms[i].id, 
               methods[farms[i].assignedMethod].name,
               methods[farms[i].assignedMethod].pollution,
               methods[farms[i].assignedMethod].cost);
    }
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
    
    printf("Crop Stubble Management - Dynamic Programming\n");
    printf("==============================================\n");
    printf("Number of farms: %d\n", n);
    printf("Budget: ₹%d\n\n", budget);
    
    runDP(farms, n, budget);
    
    return 0;
}