'use client';

import { useState, useEffect, useCallback } from 'react';
import PeriodRangeSelector from './PeriodRangeSelector';
import TopExpenses from './TopExpenses';
import PeakSpending from './PeakSpending';
import { BiweeklyRange, Entry } from '../../../../lib/types';
import { useBudgetStorage } from '../../../../lib/hooks/useBudgetStorage';
import BudgetHistoryDialog from './BudgetHistoryDialog';
import BiweeklyChartDialog from './BiweeklyChartDialog';
import BudgetSection from './BudgetSection';
import { groupPeriodBudgets } from '../../../../lib/functions';
import StatsGrid from './StatsGrid';
import {
  useBiweeklyHistory,
  useBiweeklySummary,
} from '../../../../lib/hooks/useBiweeklySummary';

const biweeklyPresets: BiweeklyRange[] = [
  { startDay1: 1, startDay2: 16, label: '01-15 / 16-30' },
  { startDay1: 5, startDay2: 21, label: '05-20 / 21-04' },
];

type SummaryProps = {
  budgetId: string;
  entries: Entry[];
  budget: number;
  setBudget: (newBudget: number) => void;
  budgetName?: string;
  isEditingBudget: boolean;
  setIsEditingBudget: (isEditing: boolean) => void;
  onPayDebt?: (amount: number) => void; // Add this line
};

export default function Summary({
  budgetId,
  entries,
  budget,
  setBudget,
  onPayDebt,
  isEditingBudget,
  setIsEditingBudget,
}: SummaryProps) {
  const BIWEEKLY_STORAGE_KEY = `biweekly-range-${budgetId}`;

  const [tempBudget, setTempBudget] = useState(budget.toString());
  const [biweeklyRange, setBiweeklyRangeState] = useState<BiweeklyRange>(
    biweeklyPresets[0]
  );
  const [showBudgetHistory, setShowBudgetHistory] = useState(false);

  const [, setHasMounted] = useState(false);

  const {
    updateBudget,
    currentBudget: storedBudget,
    periodBudgets,
    lastResetDate,
  } = useBudgetStorage(budgetId, budget);

  useEffect(() => {
    setHasMounted(true);
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = () => {
    // Load biweekly range only — budget data is handled by useBudgetStorage
    const savedRange = localStorage.getItem(BIWEEKLY_STORAGE_KEY);
    if (savedRange) {
      try {
        const parsed = JSON.parse(savedRange);
        if (parsed?.startDay1 && parsed?.startDay2) {
          setBiweeklyRangeState(parsed);
        }
      } catch (e) {
        console.error('Invalid biweekly range:', e);
      }
    }
  };

  const getCurrentPeriodKey = useCallback(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startDay =
      day < biweeklyRange.startDay2
        ? biweeklyRange.startDay1
        : biweeklyRange.startDay2;
    return `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
  }, [biweeklyRange]);

  const checkAndResetBudget = useCallback(() => {
    const currentPeriodKey = getCurrentPeriodKey();
    if (lastResetDate === currentPeriodKey) return false;

    // Get the budget for this period or use current budget
    const periodBudget = periodBudgets[currentPeriodKey] || storedBudget;

    updateBudget(periodBudget, currentPeriodKey);
    return true;
  }, [
    getCurrentPeriodKey,
    lastResetDate,
    periodBudgets,
    storedBudget,
    updateBudget,
  ]);

  useEffect(() => {
    checkAndResetBudget();
  }, [biweeklyRange, checkAndResetBudget]);

  // Add this to your Summary component
  useEffect(() => {
    console.log('Current budget data:', {
      storedBudget,
      periodBudgets,
      lastResetDate,
      currentPeriodKey: getCurrentPeriodKey(),
    });
  }, [storedBudget, periodBudgets, lastResetDate, getCurrentPeriodKey]);

  const { percentageUsed } = useBiweeklySummary({
    entries,
    budgetId,
    budget,
    biweeklyRange,
  });

  const { periods, totalSavings, totalDebt } = useBiweeklyHistory({
    entries,
    budgetId,
    budget,
    biweeklyRange,
    budgetStorageKey: `budget-${budgetId}`,
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
        debtPayments: 0, // Add this to match the type
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
    const currentPeriodKey = getCurrentPeriodKey();
    updateBudget(newBudget, currentPeriodKey);
    setIsEditingBudget(false);
    setBudget(newBudget);
  };

  const handleBudgetCancel = () => {
    setTempBudget(budget.toString());
    setIsEditingBudget(false);
  };

  const setBiweeklyRange = (range: BiweeklyRange) => {
    setBiweeklyRangeState(range);
    localStorage.setItem(BIWEEKLY_STORAGE_KEY, JSON.stringify(range));
    checkAndResetBudget();
  };

  const formatBiweeklyLabel = (periodKey: string) => {
    const [year, month, day] = periodKey.split('-').map(Number);
    const monthName = new Date(year, month - 1).toLocaleString('default', {
      month: 'short',
    });
    const endDay =
      day === biweeklyRange.startDay1
        ? biweeklyRange.startDay2 - 1
        : new Date(year, month, 0).getDate();
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

      <PeriodRangeSelector
        biweeklyRange={biweeklyRange}
        biweeklyPresets={biweeklyPresets}
        setBiweeklyRange={setBiweeklyRange}
      />

      <BiweeklyChartDialog
        periods={periods}
        periodBudgets={periodBudgets}
        formatBiweeklyLabel={formatBiweeklyLabel}
        onBudgetChange={(period, newBudget) => updateBudget(newBudget, period)}
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
          budget={peakPeriodData.budget}
          formatBiweeklyLabel={formatBiweeklyLabel}
        />
      )}

      {mostExpensivePerPeriod.length > 0 && (
        <TopExpenses
          expenses={mostExpensivePerPeriod.slice(0, 2)}
          formatBiweeklyLabel={formatBiweeklyLabel}
        />
      )}

      <BudgetHistoryDialog
        showBudgetHistory={showBudgetHistory}
        setShowBudgetHistory={setShowBudgetHistory}
        periodBudgets={groupPeriodBudgets(periodBudgets, biweeklyRange)}
        formatBiweeklyLabel={formatBiweeklyLabel}
        biweeklyRange={biweeklyRange}
      />
    </div>
  );
}
