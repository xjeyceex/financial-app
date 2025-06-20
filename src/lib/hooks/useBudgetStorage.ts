import { useState, useEffect, useCallback, useRef } from 'react';
import { BudgetStorage } from '../types';
import { loadBudget, saveBudget } from '../indexedDB';

export function useBudgetStorage(budgetId: string, initialBudget: number) {
  const [budgetData, setBudgetData] = useState<BudgetStorage>({
    currentBudget: initialBudget,
    periodBudgets: {},
    lastResetDate: '',
  });

  const didLoad = useRef(false);
  const prevData = useRef<BudgetStorage | null>(null);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const data = await loadBudget(budgetId);
        if (data) {
          const newBudgetData: BudgetStorage = {
            currentBudget: data.currentBudget ?? initialBudget,
            periodBudgets: data.periodBudgets ?? {},
            lastResetDate: data.lastResetDate ?? '',
          };
          setBudgetData(newBudgetData);
          prevData.current = newBudgetData;
        }
      } catch (err) {
        console.error(`Failed to load budget from IndexedDB:`, err);
      } finally {
        didLoad.current = true;
      }
    };

    loadFromDB();
  }, [budgetId, initialBudget]);

  // Save to IndexedDB only if data changes and after initial load
  useEffect(() => {
    if (!didLoad.current) return;

    const hasChanged =
      JSON.stringify(prevData.current) !== JSON.stringify(budgetData);

    if (hasChanged) {
      saveBudget(budgetId, budgetData).catch((err) =>
        console.error(`Failed to save budget to IndexedDB:`, err)
      );
      prevData.current = budgetData;
    }
  }, [budgetId, budgetData]);

  const updateBudget = useCallback((newBudget: number, periodKey: string) => {
    setBudgetData((prev) => {
      const updated: BudgetStorage = {
        currentBudget: newBudget,
        periodBudgets: {
          ...prev.periodBudgets,
          [periodKey]: newBudget,
        },
        lastResetDate: periodKey,
      };
      return updated;
    });
  }, []);

  return {
    budgetData,
    updateBudget,
    currentBudget: budgetData.currentBudget,
    periodBudgets: budgetData.periodBudgets,
    lastResetDate: budgetData.lastResetDate,
  };
}
