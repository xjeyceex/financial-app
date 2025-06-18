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

    // First pass: Calculate regular expenses and identify debt payments
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
          debtPayments: 0, // Initialize debtPayments to 0
        };
      }

      // Skip debt payments in regular total calculation
      if (entry.item !== 'Debt Payment') {
        data[key].total += entry.amount;
        data[key].savings = data[key].budget - data[key].total;

        const itemKey = entry.item || 'Unspecified';
        data[key].items[itemKey] =
          (data[key].items[itemKey] || 0) + entry.amount;
      }
    });

    // Second pass: Calculate debt payments separately
    currentBudgetEntries.forEach((entry) => {
      if (entry.item === 'Debt Payment') {
        const date = new Date(entry.date);
        const key = getBiweeklyKey(date, biweeklyRange);

        if (data[key]) {
          data[key].debtPayments += entry.amount;
        }
      }
    });

    const periods = Object.entries(data).sort(([a], [b]) => (a < b ? -1 : 1));

    // Calculate savings and debt considering debt payments
    const savingsPerPeriod = periods.map(([, d]) => {
      // Savings after debt payments
      return d.savings - d.debtPayments;
    });

    const averageBiweeklyExpenses =
      periods.reduce((sum, [, d]) => sum + d.total, 0) / (periods.length || 1);

    const averageBiweeklySavings =
      savingsPerPeriod.reduce((sum, s) => sum + s, 0) /
      (savingsPerPeriod.length || 1);

    // Total savings is the sum of all positive period savings
    const totalSavings = savingsPerPeriod
      .filter((s) => s >= 0)
      .reduce((sum, s) => sum + s, 0);

    // Total debt is the sum of all negative period savings (absolute value)
    // minus any debt payments made
    const totalDebt = Math.max(
      0,
      savingsPerPeriod
        .filter((s) => s < 0)
        .reduce((sum, s) => sum + Math.abs(s), 0) -
        periods.reduce((sum, [, d]) => sum + d.debtPayments, 0)
    );

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
