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
  biweeklyRange,
  periodBudgets,
}: {
  entries: Entry[];
  budgetId: string;
  biweeklyRange: BiweeklyRange;
  periodBudgets: Record<string, number>;
}) {
  return useMemo(() => {
    const data: Record<string, BiweeklyData> = {};

    // ✅ Initialize all period budgets FIRST — even if there are no entries
    Object.entries(periodBudgets).forEach(([key, budget]) => {
      if (!data[key]) {
        data[key] = {
          total: 0,
          budget,
          savings: 0,
          items: {},
          debtPayments: 0,
        };
      }
    });

    const currentBudgetEntries = entries.filter((e) => e.budgetId === budgetId);

    // ✅ Add regular (non-debt) entries
    currentBudgetEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = getBiweeklyKey(date, biweeklyRange);

      if (!data[key]) {
        // Ensure any unexpected key is still initialized
        data[key] = {
          total: 0,
          budget: periodBudgets[key] ?? 0,
          savings: 0,
          items: {},
          debtPayments: 0,
        };
      }

      if (entry.item !== 'Debt Payment') {
        data[key].total += entry.amount;

        const itemKey = entry.item || 'Unspecified';
        data[key].items[itemKey] =
          (data[key].items[itemKey] || 0) + entry.amount;
      }
    });

    // ✅ Compute initial savings (before debt payments)
    Object.values(data).forEach((d) => {
      d.savings = d.budget - d.total;
    });

    // ✅ Add debt payments
    currentBudgetEntries.forEach((entry) => {
      if (entry.item === 'Debt Payment') {
        const date = new Date(entry.date);
        const key = getBiweeklyKey(date, biweeklyRange);

        if (!data[key]) {
          // Just in case a debt entry is on a period that wasn't initialized
          data[key] = {
            total: 0,
            budget: periodBudgets[key] ?? 0,
            savings: 0,
            items: {},
            debtPayments: 0,
          };
        }

        data[key].debtPayments += entry.amount;
      }
    });

    const periods = Object.entries(data).sort(([a], [b]) => (a < b ? -1 : 1));

    // 💡 Calculate *net* savings per period (after debt payments)
    const savingsPerPeriod = periods.map(([, d]) => d.savings - d.debtPayments);

    const averageBiweeklyExpenses =
      periods.reduce((sum, [, d]) => sum + d.total, 0) / (periods.length || 1);

    const averageBiweeklySavings =
      savingsPerPeriod.reduce((sum, s) => sum + s, 0) /
      (savingsPerPeriod.length || 1);

    // ✅ totalSavings only includes positive net savings
    const totalSavings = savingsPerPeriod
      .filter((s) => s >= 0)
      .reduce((sum, s) => sum + s, 0);

    // ✅ totalDebt = absolute value of negative net savings (minus paid debt)
    const totalDebt = Math.max(
      0,
      savingsPerPeriod
        .filter((s) => s < 0)
        .reduce((sum, s) => sum + Math.abs(s), 0) -
        periods.reduce((sum, [, d]) => sum + d.debtPayments, 0)
    );

    console.log('📊 Period keys in history:', Object.keys(data));

    return {
      biweeklyData: data,
      periods,
      savingsPerPeriod,
      averageBiweeklyExpenses,
      averageBiweeklySavings,
      totalSavings,
      totalDebt,
    };
  }, [entries, budgetId, biweeklyRange, periodBudgets]);
}
