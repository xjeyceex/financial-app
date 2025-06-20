import { Budget } from './typesv2';

export const getLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

// Updated to work with the new Budget structure
export const determinePayPeriod = (startDate: string): 'first' | 'second' => {
  const date = new Date(startDate);
  return date.getDate() <= 15 ? 'first' : 'second';
};

// Updated to use currentPeriod dates directly
export const formatPayPeriodDisplay = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.getDate()}-${end.getDate()} ${start.toLocaleString('default', { month: 'short' })}`;
};

// New utility to get display info for a budget
export const getBudgetPeriodInfo = (budget: Budget) => {
  return {
    display: formatPayPeriodDisplay(
      budget.currentPeriod.startDate,
      budget.currentPeriod.endDate
    ),
    period: determinePayPeriod(budget.currentPeriod.startDate),
  };
};

export const calculatePeriodBalance = (
  period: Budget['currentPeriod']
): number => {
  const totalExpenses = period.entries
    .filter((e) => e.amount > 0) // Only count expenses
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netPayments = period.entries
    .filter((e) => e.amount < 0) // Only count payments
    .reduce((sum, entry) => sum + entry.amount, 0);

  return period.amount - totalExpenses + netPayments;
};

// In your utility functions file

export const calculateAvailableFunds = (budget: Budget | null): number => {
  if (!budget) return 0;

  const pastPeriod = budget.pastPeriods?.[0];
  const carriedOver =
    (pastPeriod?.amount ?? 0) -
    (pastPeriod?.entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0);

  const currentAmount = (budget.currentPeriod.amount ?? 0) + carriedOver;
  const currentExpenses =
    budget.currentPeriod.entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  const available = currentAmount - currentExpenses;
  return Math.max(0, available); // If you’re overspent, available = 0
};

export const calculateTotalDebt = (budget: Budget | null): number => {
  if (!budget) return 0;

  const pastPeriod = budget.pastPeriods?.[0];
  const carriedOver =
    (pastPeriod?.amount ?? 0) -
    (pastPeriod?.entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0);

  const currentAmount = (budget.currentPeriod.amount ?? 0) + carriedOver;
  const currentExpenses =
    budget.currentPeriod.entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  const balance = currentAmount - currentExpenses;
  return balance < 0 ? Math.abs(balance) : 0;
};

export const getCurrentPeriodDates = (date: Date = new Date()) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const isFirstHalf = date.getDate() <= 15;

  return {
    start: new Date(year, month, isFirstHalf ? 1 : 16).toISOString(),
    end: new Date(
      year,
      month + (isFirstHalf ? 0 : 1),
      isFirstHalf ? 15 : 0
    ).toISOString(),
  };
};
