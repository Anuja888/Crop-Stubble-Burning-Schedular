/**
 * Greedy Algorithm for Crop Stubble Management Optimization
 * 
 * Approach: Sort farms by window (most urgent first), then for each farm
 * try methods in priority order: BIO -> MANUAL -> MULCHING -> BURNING
 * Pick the first method that fits within the window and budget.
 * 
 * Time Complexity: O(n log n) due to sorting
 * Space Complexity: O(n)
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

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

// Method definitions (matching constants.js)
Method methods[NUM_METHODS] = {
    {"Bio-Decomposer", 7, 500, 5, "#3b82f6", "BIO"},
    {"Manual Removal", 5, 1500, 10, "#f59e0b", "MAN"},
    {"Machine Mulching", 3, 3000, 0, "#10b981", "MULCH"},
    {"Burning", 1, 0, 100, "#ef4444", "BURN"}
};

// Priority order for greedy: BIO -> MANUAL -> MULCHING -> BURNING
MethodType priorityOrder[NUM_METHODS] = {BIO, MANUAL, MULCHING, BURNING};

// Compare function for sorting farms by window (ascending)
int compareByWindow(const void* a, const void* b) {
    Farm* farmA = (Farm*)a;
    Farm* farmB = (Farm*)b;
    return farmA->window - farmB->window;
}

// Compare function for sorting farms by ID
int compareById(const void* a, const void* b) {
    Farm* farmA = (Farm*)a;
    Farm* farmB = (Farm*)b;
    // Extract numeric part from ID (e.g., "F1" -> 1)
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

// Run Greedy Algorithm
void runGreedy(Farm* farms, int n, int budget) {
    clock_t start = clock();
    
    // Calculate windows
    for (int i = 0; i < n; i++) {
        farms[i].window = farms[i].deadline - farms[i].harvestDay;
    }
    
    // Sort by window (most urgent first)
    qsort(farms, n, sizeof(Farm), compareByWindow);
    
    int budgetLeft = budget;
    int totalPollution = 0;
    int totalCost = 0;
    
    printf("\n=== GREEDY ALGORITHM ===\n\n");
    
    for (int i = 0; i < n; i++) {
        printf("Farm %s: window=%d, risk=%s\n", 
               farms[i].id, farms[i].window, getRiskLevel(farms[i].window));
        
        MethodType chosen = -1;
        
        // Try methods in priority order
        for (int j = 0; j < NUM_METHODS; j++) {
            MethodType mType = priorityOrder[j];
            Method* m = &methods[mType];
            
            printf("  Try %s (days=%d, cost=₹%d) → deadline=%s, budget=%s\n",
                   m->name, m->days, m->cost,
                   (m->days <= farms[i].window) ? "OK" : "FAIL",
                   (budgetLeft >= m->cost) ? "OK" : "FAIL");
            
            if (m->days <= farms[i].window && budgetLeft >= m->cost) {
                chosen = mType;
                printf("  → Selected %s for %s\n", m->name, farms[i].id);
                break;
            }
        }
        
        if (chosen == -1) {
            // Fallback to burning
            chosen = BURNING;
            printf("  → FALLBACK: Burning assigned to %s\n", farms[i].id);
        }
        
        farms[i].assignedMethod = chosen;
        budgetLeft -= methods[chosen].cost;
        totalPollution += methods[chosen].pollution;
        totalCost += methods[chosen].cost;
    }
    
    // Sort back to original order
    qsort(farms, n, sizeof(Farm), compareById);
    
    double timeMs = (double)(clock() - start) * 1000.0 / CLOCKS_PER_SEC;
    
    printf("\n--- GREEDY RESULTS ---\n");
    printf("Total Pollution: %d units\n", totalPollution);
    printf("Total Cost: ₹%d\n", totalCost);
    printf("Time: %.3f ms\n", timeMs);
    printf("\nAssignments:\n");
    for (int i = 0; i < n; i++) {
        printf("  %s → %s\n", farms[i].id, methods[farms[i].assignedMethod].name);
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
    
    printf("Crop Stubble Management - Greedy Algorithm\n");
    printf("==========================================\n");
    printf("Number of farms: %d\n", n);
    printf("Budget: ₹%d\n\n", budget);
    
    runGreedy(farms, n, budget);
    
    return 0;
}