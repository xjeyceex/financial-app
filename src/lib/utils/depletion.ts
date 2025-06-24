// utils/depletion.ts
import { differenceInDays } from 'date-fns';
import { OneTimeEntry } from '../typesv2';

export const estimateDepletionDate = (
  entries: OneTimeEntry[],
  budgetAmount: number
): string | null => {
  const filtered = entries.filter((e) => !e.excludeFromDepletion);
  if (filtered.length < 2) return null;

  const sorted = filtered
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const total = sorted.reduce((sum, e) => sum + e.amount, 0);
  const days =
    differenceInDays(
      new Date(sorted[sorted.length - 1].date),
      new Date(sorted[0].date)
    ) || 1;
  const rate = total / days;
  const remaining = budgetAmount - total;
  const daysLeft = remaining / rate;
  const depletion = new Date(sorted[sorted.length - 1].date);
  depletion.setDate(depletion.getDate() + Math.ceil(daysLeft));
  return depletion.toISOString().split('T')[0];
};
