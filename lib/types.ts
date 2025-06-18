export type Entry = {
  id: string;
  amount: number;
  item?: string;
  date: string;
  description?: string;
  budgetId: string;
};

export type BiweeklyData = {
  total: number;
  budget: number;
  savings: number;
  items: Record<string, number>;
};

export type BiweeklyRange = {
  startDay1: number;
  startDay2: number;
  label: string;
};

export type BudgetStorage = {
  currentBudget: number; // The currently active budget amount
  periodBudgets: Record<
    // Stores budgets for all historical periods
    string, // Key format: "YYYY-MM-DD" (start day of period)
    number // Budget amount for that period
  >;
  lastResetDate: string; // When the budget was last reset (in same YYYY-MM-DD format)
};
