import { useMemo } from 'react';
import { Entry, BiweeklyRange, BiweeklyData } from '../types';
import {
  getBiweeklyKey,
  getPeriodEndDate,
  getPeriodStartDate,
} from '../functions';

export function useBiweeklySummary({
  entries,
  budgetId,
  budget,
  biweeklyRange,
}: {
  entries: Entry[];
  budgetId: string;
  budget: number;
  biweeklyRange: BiweeklyRange;
}) {
  const { currentPeriodEntries, totalSpent, remaining, percentageUsed } =
    useMemo(() => {
      const currentPeriodStart = getPeriodStartDate(biweeklyRange);
      const currentPeriodEnd = getPeriodEndDate(biweeklyRange);

      const currentBudgetEntries = entries.filter(
        (e) => e.budgetId === budgetId
      );
      const currentPeriodEntries = currentBudgetEntries.filter((entry) => {
        const date = new Date(entry.date);
        return date >= currentPeriodStart && date <= currentPeriodEnd;
      });

      const totalSpent = currentPeriodEntries.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const remaining = budget - totalSpent;
      const percentageUsed = (totalSpent / budget) * 100;

      return { currentPeriodEntries, totalSpent, remaining, percentageUsed };
    }, [entries, budgetId, budget, biweeklyRange]);

  return {
    currentPeriodEntries,
    totalSpent,
    remaining,
    percentageUsed,
  };
}

export function useBiweeklyHistory({
  entries,
  budgetId,
  budget,
  biweeklyRange,
  budgetStorageKey,
}: {
  entries: Entry[];
  budgetId: string;
  budget: number;
  biweeklyRange: BiweeklyRange;
  budgetStorageKey: string;
}) {
  return useMemo(() => {
    const data: Record<string, BiweeklyData> = {};
    const currentBudgetEntries = entries.filter((e) => e.budgetId === budgetId);

    currentBudgetEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = getBiweeklyKey(date, biweeklyRange);

      if (!data[key]) {
        const savedBudget = localStorage.getItem(budgetStorageKey);
        let periodBudget = budget;

        if (savedBudget) {
          try {
            const parsed = JSON.parse(savedBudget);
            periodBudget =
              parsed?.periodBudgets?.[key] ?? parsed?.currentBudget ?? budget;
          } catch (e) {
            console.error('Error parsing budget data:', e);
          }
        }

        data[key] = {
          total: 0,
          budget: periodBudget,
          savings: periodBudget,
          items: {},
        };
      }

      data[key].total += entry.amount;
      data[key].savings = data[key].budget - data[key].total;
      const itemKey = entry.item || 'Unspecified';
      data[key].items[itemKey] = (data[key].items[itemKey] || 0) + entry.amount;
    });

    const periods = Object.entries(data).sort(([a], [b]) => (a < b ? -1 : 1));
    const savingsPerPeriod = periods.map(([, d]) => d.savings);

    const averageBiweeklyExpenses =
      periods.reduce((sum, [, d]) => sum + d.total, 0) / (periods.length || 1);

    const averageBiweeklySavings =
      savingsPerPeriod.reduce((sum, s) => sum + s, 0) /
      (savingsPerPeriod.length || 1);

    const totalSavings = savingsPerPeriod
      .filter((s) => s >= 0)
      .reduce((sum, s) => sum + s, 0);

    const totalDebt = savingsPerPeriod
      .filter((s) => s < 0)
      .reduce((sum, s) => sum + Math.abs(s), 0);

    return {
      biweeklyData: data,
      periods,
      savingsPerPeriod,
      averageBiweeklyExpenses,
      averageBiweeklySavings,
      totalSavings,
      totalDebt,
    };
  }, [entries, budgetId, budget, biweeklyRange, budgetStorageKey]);
}
