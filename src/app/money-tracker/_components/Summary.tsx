'use client';

import { useState, useEffect, useCallback } from 'react';
import TopExpenses from './TopExpenses';
import PeakSpending from './PeakSpending';
import { Entry } from '../../../../lib/types';
import { useBudgetStorage } from '../../../../lib/hooks/useBudgetStorage';
import BudgetHistoryDialog from './BudgetHistoryDialog';
import BudgetSection from './BudgetSection';
import StatsGrid from './StatsGrid';
import PeriodChartDialog from './PeriodChartDialog';
import {
  usePeriodHistory,
  usePeriodSummary,
} from '../../../../lib/hooks/usePeriodSummary';

type SummaryProps = {
  budgetId: string;
  entries: Entry[];
  budget: number;
  setBudget: (newBudget: number) => void;
  isEditingBudget: boolean;
  setIsEditingBudget: (isEditing: boolean) => void;
  onPayDebt?: (amount: number) => void;
  recurring: boolean;
};

export default function Summary({
  budgetId,
  entries,
  budget,
  setBudget,
  onPayDebt,
  isEditingBudget,
  setIsEditingBudget,
  recurring,
}: SummaryProps) {
  const [tempBudget, setTempBudget] = useState(budget.toString());
  const [showBudgetHistory, setShowBudgetHistory] = useState(false);

  useEffect(() => {
    setTempBudget(budget.toString());
  }, [budget]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const activePeriodKey = `${year}-${String(month + 1).padStart(2, '0')}-${day <= 15 ? '01' : '16'}`;

  const {
    updateBudget,
    currentBudget: storedBudget,
    periodBudgets,
    lastResetDate,
  } = useBudgetStorage(budgetId, budget);

  const checkAndResetBudget = useCallback(() => {
    if (!recurring) return false;
    if (lastResetDate === activePeriodKey) return false;

    const periodBudget = periodBudgets[activePeriodKey] || storedBudget;
    updateBudget(periodBudget, activePeriodKey);
    return true;
  }, [
    recurring,
    activePeriodKey,
    lastResetDate,
    periodBudgets,
    storedBudget,
    updateBudget,
  ]);

  useEffect(() => {
    checkAndResetBudget();
  }, [checkAndResetBudget]);

  const { percentageUsed } = usePeriodSummary({
    entries,
    budgetId,
    budget,
  });

  const currentKey = activePeriodKey;

  const computedPeriodBudgets = {
    ...periodBudgets,
    [currentKey]: budget,
  };

  const { periods, totalSavings, totalDebt } = usePeriodHistory({
    entries,
    budgetId,
    periodBudgets: computedPeriodBudgets,
  });

  const [peakPeriodKey, peakPeriodData] = periods.reduce(
    (a, b) => (b[1].total > a[1].total ? b : a),
    [
      '',
      {
        total: 0,
        items: {},
        budget: 0,
        savings: 0,
        debtPayments: 0,
      },
    ]
  );

  const mostExpensivePerPeriod = periods.map(([period, data]) => {
    const [item, amount] = Object.entries(data.items).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['', 0]
    );
    return { period, item, amount };
  });

  const handleBudgetSave = () => {
    const newBudget = parseFloat(tempBudget) || 0;
    updateBudget(newBudget, activePeriodKey);
    setIsEditingBudget(false);
    setBudget(newBudget);
  };

  const handleBudgetCancel = () => {
    setTempBudget(budget.toString());
    setIsEditingBudget(false);
  };

  const formatPeriodLabel = (periodKey: string) => {
    const [year, month, day] = periodKey.split('-').map(Number);
    const monthName = new Date(year, month - 1).toLocaleString('default', {
      month: 'short',
    });
    const endDay = day === 1 ? 15 : new Date(year, month, 0).getDate();
    return `${monthName} ${day}-${endDay}`;
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-4">
      <BudgetSection
        isEditingBudget={isEditingBudget}
        budget={budget}
        percentageUsed={percentageUsed}
        entries={entries}
        tempBudget={tempBudget}
        setTempBudget={setTempBudget}
        handleBudgetSave={handleBudgetSave}
        handleBudgetCancel={handleBudgetCancel}
        setIsEditingBudget={setIsEditingBudget}
        setShowBudgetHistory={setShowBudgetHistory}
      />

      {recurring && (
        <>
          <PeriodChartDialog
            periods={periods}
            periodBudgets={periodBudgets}
            formatPeriodLabel={formatPeriodLabel}
            currentPeriodKey={activePeriodKey} // <--
            currentBudget={budget} // <--
            onBudgetChange={(period, newBudget) =>
              updateBudget(newBudget, period)
            }
          />

          <StatsGrid
            totalDebt={totalDebt}
            totalSavings={totalSavings}
            onPayDebt={onPayDebt}
          />

          {peakPeriodKey && (
            <PeakSpending
              peakPeriodKey={peakPeriodKey}
              peakPeriodData={peakPeriodData}
              formatPeriodLabel={formatPeriodLabel}
            />
          )}
        </>
      )}

      <TopExpenses
        expenses={mostExpensivePerPeriod.slice(0, 2)}
        formatPeriodLabel={formatPeriodLabel}
        activePeriodKey={activePeriodKey}
      />

      <BudgetHistoryDialog
        showBudgetHistory={showBudgetHistory}
        setShowBudgetHistory={setShowBudgetHistory}
        periodBudgets={periodBudgets}
        updateBudget={updateBudget} // ✅ now passed in
        formatPeriodLabel={formatPeriodLabel}
        currentPeriodKey={activePeriodKey}
        currentBudget={budget}
      />
    </div>
  );
}
