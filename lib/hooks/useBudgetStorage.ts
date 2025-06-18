import { useState, useEffect, useCallback } from 'react';
import { BudgetStorage } from '../types';

export function useBudgetStorage(budgetId: string, initialBudget: number) {
  const BUDGET_STORAGE_KEY = `budget-${budgetId}`;

  const [budgetData, setBudgetData] = useState<BudgetStorage>({
    currentBudget: initialBudget,
    periodBudgets: {},
    lastResetDate: '',
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setBudgetData({
          currentBudget: parsed.currentBudget ?? initialBudget,
          periodBudgets: parsed.periodBudgets ?? {},
          lastResetDate: parsed.lastResetDate ?? '',
        });
      }
    } catch (e) {
      console.error('Failed to parse budget data:', e);
    }
  }, [BUDGET_STORAGE_KEY, initialBudget]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetData));
  }, [BUDGET_STORAGE_KEY, budgetData]);

  const updateBudget = useCallback((newBudget: number, periodKey: string) => {
    setBudgetData((prev) => ({
      currentBudget: newBudget,
      periodBudgets: {
        ...prev.periodBudgets,
        [periodKey]: newBudget,
      },
      lastResetDate: periodKey,
    }));
  }, []);

  return {
    budgetData,
    updateBudget,
    currentBudget: budgetData.currentBudget,
    periodBudgets: budgetData.periodBudgets,
    lastResetDate: budgetData.lastResetDate,
  };
}
