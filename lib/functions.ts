import { BiweeklyRange } from './types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export function getPeriodStartDate(range: BiweeklyRange): Date {
  const now = new Date();
  const currentDay = now.getDate();
  const startDay =
    currentDay < range.startDay2 ? range.startDay1 : range.startDay2;
  return new Date(now.getFullYear(), now.getMonth(), startDay);
}

export function getPeriodEndDate(range: BiweeklyRange): Date {
  const now = new Date();
  const currentDay = now.getDate();
  const startDay =
    currentDay < range.startDay2 ? range.startDay1 : range.startDay2;
  const endDay =
    startDay === range.startDay1
      ? range.startDay2 - 1
      : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return new Date(now.getFullYear(), now.getMonth(), endDay, 23, 59, 59, 999);
}

export function getBiweeklyKey(date: Date, range: BiweeklyRange): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const startDay = day < range.startDay2 ? range.startDay1 : range.startDay2;
  return `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
}

export function groupPeriodBudgets(
  periodBudgets: Record<string, number>,
  range: BiweeklyRange
) {
  const grouped: Record<string, number> = {};
  Object.entries(periodBudgets).forEach(([period, budget]) => {
    const [, , day] = period.split('-').map(Number);
    if (day === range.startDay1 || day === range.startDay2) {
      grouped[period] = budget;
    }
  });
  return grouped;
}
