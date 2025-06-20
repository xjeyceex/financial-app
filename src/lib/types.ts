export type Entry = {
  id: string;
  amount: number;
  item?: string;
  date: string;
  description?: string;
  budgetId: string;
};

export type BudgetStorage = {
  currentBudget: number;
  periodBudgets: Record<string, number>;
  lastResetDate: string;
};
