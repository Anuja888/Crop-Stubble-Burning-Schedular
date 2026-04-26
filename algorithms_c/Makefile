# Makefile for Crop Stubble Management Algorithms in C

CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
LDFLAGS = -lm

# Targets
TARGETS = greedy dp backtrack

# Default target
all: $(TARGETS)

# Greedy algorithm
greedy: greedy.c
	$(CC) $(CFLAGS) -o greedy greedy.c $(LDFLAGS)

# Dynamic Programming algorithm
dp: dynamic_programming.c
	$(CC) $(CFLAGS) -o dp dynamic_programming.c $(LDFLAGS)

# Backtracking algorithm
backtrack: backtracking.c
	$(CC) $(CFLAGS) -o backtrack backtracking.c $(LDFLAGS)

# Run all algorithms
run: all
	@echo "=== Running Greedy Algorithm ==="
	./greedy
	@echo ""
	@echo "=== Running Dynamic Programming Algorithm ==="
	./dp
	@echo ""
	@echo "=== Running Backtracking Algorithm ==="
	./backtrack

# Clean build artifacts
clean:
	rm -f $(TARGETS) *.o

# Clean and rebuild
rebuild: clean all

# Help
help:
	@echo "Available targets:"
	@echo "  all      - Compile all algorithms (default)"
	@echo "  greedy   - Compile greedy algorithm only"
	@echo "  dp       - Compile dynamic programming algorithm only"
	@echo "  backtrack- Compile backtracking algorithm only"
	@echo "  run      - Compile and run all algorithms"
	@echo "  clean    - Remove compiled files"
	@echo "  rebuild  - Clean and recompile"
	@echo "  help     - Show this help message"

.PHONY: all run clean rebuild help