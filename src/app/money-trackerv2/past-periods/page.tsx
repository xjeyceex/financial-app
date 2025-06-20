'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Budget } from '../../../../lib/typesv2';
import { getDb } from '../../../../lib/db';
import { BudgetPeriod } from '../_components/BudgetPeriod';

export default function PastPeriodsPage() {
  const searchParams = useSearchParams();
  const budgetId = searchParams.get('budgetId');
  const [budget, setBudget] = useState<Budget | null>(null);

  useEffect(() => {
    const loadBudget = async () => {
      const db = await getDb();
      const result = await db.get('budgets', budgetId as string);
      setBudget(result);
    };

    if (budgetId) {
      loadBudget();
    }
  }, [budgetId]);

  const onEditPastAmount = async (periodId: string, newAmount: number) => {
    if (!budget) return;

    const updatedPastPeriods = (budget.pastPeriods ?? []).map((period) =>
      period.id === periodId
        ? {
            ...period,
            amount: newAmount,
            finalBalance:
              newAmount -
              (period.entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0),
          }
        : period
    );

    const totalFinalBalance = updatedPastPeriods.reduce((sum, period) => {
      const amount = period.amount ?? 0;
      const entriesTotal =
        period.entries?.reduce((s, e) => s + e.amount, 0) ?? 0;
      const final = period.finalBalance ?? amount - entriesTotal;
      return sum + final;
    }, 0);

    const newCarriedOver = {
      savings: totalFinalBalance > 0 ? totalFinalBalance : 0,
      debt: totalFinalBalance < 0 ? Math.abs(totalFinalBalance) : 0,
    };

    const updatedBudget: Budget = {
      ...budget,
      pastPeriods: updatedPastPeriods,
      currentPeriod: {
        ...budget.currentPeriod,
        carriedOver: newCarriedOver,
      },
    };

    const db = await getDb();
    await db.put('budgets', updatedBudget);
    setBudget(updatedBudget);
  };

  if (!budget) return <p>Loading...</p>;

  const pastPeriods = budget.pastPeriods ?? [];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {budget.name} - Past Periods
      </h1>

      {pastPeriods.length === 0 ? (
        <p className="text-muted-foreground">No past periods.</p>
      ) : (
        <div className="space-y-6">
          {pastPeriods
            .sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime()
            )
            .map((period) => (
              <BudgetPeriod
                key={period.id}
                period={period}
                onAmountChange={(newAmount) =>
                  onEditPastAmount(period.id, newAmount)
                }
                onEntryEdit={() => {}}
                onEntryDelete={() => {}}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ⚠ This is required to make dynamic routing work in App Router
export const dynamic = 'force-dynamic';
