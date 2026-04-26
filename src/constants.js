export const METHODS = {
  BURNING:  { name: "Burning",          days: 1, cost: 0,    pollution: 100, color: "#ef4444", short: "BURN" },
  MULCHING: { name: "Machine Mulching", days: 3, cost: 3000, pollution: 0,   color: "#10b981", short: "MULCH" },
  BIO:      { name: "Bio-Decomposer",   days: 7, cost: 500,  pollution: 5,   color: "#3b82f6", short: "BIO" },
  MANUAL:   { name: "Manual Removal",   days: 5, cost: 1500, pollution: 10,  color: "#f59e0b", short: "MAN" },
};

export const DEFAULT_FARMS = [
  { id: "F1",  harvestDay: 8,  deadline: 18 },
  { id: "F2",  harvestDay: 10, deadline: 24 },
  { id: "F3",  harvestDay: 12, deadline: 22 },
  { id: "F4",  harvestDay: 9,  deadline: 19 },
  { id: "F5",  harvestDay: 15, deadline: 28 },
  { id: "F6",  harvestDay: 11, deadline: 18 },
  { id: "F7",  harvestDay: 7,  deadline: 21 },
  { id: "F8",  harvestDay: 13, deadline: 23 },
  { id: "F9",  harvestDay: 10, deadline: 17 },
  { id: "F10", harvestDay: 14, deadline: 27 },
];
