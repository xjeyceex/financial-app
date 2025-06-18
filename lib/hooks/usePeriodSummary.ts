import { useMemo } from 'react';
import { Entry } from '../types';

function getFixedPeriodRange(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDay = now.getDate() <= 15 ? 1 : 16;
  const endDay = startDay === 1 ? 15 : new Date(year, month + 1, 0).getDate();

  return {
    start: new Date(year, month, startDay),
    end: new Date(year, month, endDay, 23, 59, 59, 999),
  };
}

export function usePeriodSummary({
  entries,
  budgetId,
  budget,
}: {
  entries: Entry[];
  budgetId: string;
  budget: number;
}) {
  const { currentPeriodEntries, totalSpent, remaining, percentageUsed } =
    useMemo(() => {
      const { start, end } = getFixedPeriodRange();

      const currentBudgetEntries = entries.filter(
        (e) => e.budgetId === budgetId
      );
      const currentPeriodEntries = currentBudgetEntries.filter((entry) => {
        const date = new Date(entry.date);
        return date >= start && date <= end;
      });

      const totalSpent = currentPeriodEntries.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const remaining = budget - totalSpent;
      const percentageUsed = (totalSpent / budget) * 100;

      return { currentPeriodEntries, totalSpent, remaining, percentageUsed };
    }, [entries, budgetId, budget]);

  return {
    currentPeriodEntries,
    totalSpent,
    remaining,
    percentageUsed,
  };
}

type PeriodData = {
  total: number;
  budget: number;
  savings: number;
  items: Record<string, number>;
  debtPayments: number;
};

function getPeriodKey(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const startDay = day <= 15 ? 1 : 16;
  return `${year}-${String(month).padStart(2, '0')}-${startDay}`;
}

export function usePeriodHistory({
  entries,
  budgetId,
  periodBudgets,
}: {
  entries: Entry[];
  budgetId: string;
  periodBudgets: Record<string, number>;
}) {
  return useMemo(() => {
    const data: Record<string, PeriodData> = {};

    const filteredEntries = entries.filter((e) => e.budgetId === budgetId);

    const allKeys = Array.from(
      new Set([
        ...filteredEntries.map((e) => getPeriodKey(new Date(e.date))),
        ...Object.keys(periodBudgets),
      ])
    );

    allKeys.forEach((key) => {
      if (!data[key]) {
        data[key] = {
          total: 0,
          budget: periodBudgets[key] ?? 0,
          savings: 0,
          items: {},
          debtPayments: 0,
        };
      }
    });

    filteredEntries.forEach((entry) => {
      const key = getPeriodKey(new Date(entry.date));
      const record = (data[key] ??= {
        total: 0,
        budget: periodBudgets[key] ?? 0,
        savings: 0,
        items: {},
        debtPayments: 0,
      });

      if (entry.item === 'Debt Payment') {
        record.debtPayments += Math.abs(entry.amount); // supports positive or negative values
      } else {
        record.total += entry.amount;
        const itemKey = entry.item || 'Unspecified';
        record.items[itemKey] = (record.items[itemKey] || 0) + entry.amount;
      }
    });

    // Compute savings per period (before applying debt payments)
    Object.values(data).forEach((d) => {
      d.savings = d.budget - d.total;
    });

    // Sort periods chronologically
    const periods = Object.entries(data).sort(([a], [b]) => (a < b ? -1 : 1));

    // New global debt calculation logic
    let totalOverspending = 0;
    let totalDebtPayments = 0;

    periods.forEach(([, d]) => {
      if (d.total > d.budget) {
        totalOverspending += d.total - d.budget;
      }
      totalDebtPayments += d.debtPayments;
    });

    const totalDebt = Math.max(0, totalOverspending - totalDebtPayments);

    const savingsPerPeriod = periods.map(([, d]) =>
      d.budget > d.total ? d.budget - d.total : 0
    );

    const totalSavings = savingsPerPeriod.reduce((sum, s) => sum + s, 0);

    const averagePeriodExpenses =
      periods.reduce((sum, [, d]) => sum + d.total, 0) / (periods.length || 1);

    const averagePeriodSavings =
      savingsPerPeriod.reduce((sum, s) => sum + s, 0) /
      (savingsPerPeriod.length || 1);

    const netSavings = totalSavings - totalDebt;

    return {
      periodData: data,
      periods,
      savingsPerPeriod,
      averagePeriodExpenses,
      averagePeriodSavings,
      totalSavings,
      totalDebt,
      netSavings,
    };
  }, [entries, budgetId, periodBudgets]);
}
