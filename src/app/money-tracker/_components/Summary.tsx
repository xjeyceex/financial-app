'use client';

import { useState, useEffect, useCallback } from 'react';
import { Entry } from '../page';
import { Pencil, TrendingUp, TrendingDown, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BiweeklySpendingChart from './BiweeklySpendingChart';
import BudgetEditor from './BudgetEditor';
import StatsCard from './StatsCard';
import PeriodRangeSelector from './PeriodRangeSelector';
import ProgressBar from './ProgressBar';
import TopExpenses from './TopExpenses';
import PeakSpending from './PeakSpending';

type Props = {
  entries: Entry[];
  budget: number;
  setBudget: (value: number) => void;
};

export type BiweeklyData = {
  total: number;
  items: Record<string, number>;
};

export type BiweeklyRange = {
  startDay1: number;
  startDay2: number;
  label: string;
};

const biweeklyPresets: BiweeklyRange[] = [
  { startDay1: 1, startDay2: 16, label: '01-15 / 16-30' },
  { startDay1: 5, startDay2: 21, label: '05-20 / 21-04' },
];

const BIWEEKLY_STORAGE_KEY = 'moneytracker_biweekly_range';
const BUDGET_STORAGE_KEY = 'moneytracker_budget';

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function Summary({ entries, budget, setBudget }: Props) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());
  const [biweeklyRangeState, setBiweeklyRangeState] = useState<BiweeklyRange>(
    biweeklyPresets[0]
  );
  const [lastResetDate, setLastResetDate] = useState<string>('');

  const biweeklyRange = biweeklyRangeState;

  const getCurrentPeriodStartDate = (): Date => {
    const now = new Date();
    const currentDay = now.getDate();
    const startDay =
      currentDay < biweeklyRange.startDay2
        ? biweeklyRange.startDay1
        : biweeklyRange.startDay2;
    return new Date(now.getFullYear(), now.getMonth(), startDay);
  };

  const getCurrentPeriodEndDate = (): Date => {
    const now = new Date();
    const currentDay = now.getDate();
    const startDay =
      currentDay < biweeklyRange.startDay2
        ? biweeklyRange.startDay1
        : biweeklyRange.startDay2;
    const endDay =
      startDay === biweeklyRange.startDay1
        ? biweeklyRange.startDay2 - 1
        : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return new Date(now.getFullYear(), now.getMonth(), endDay, 23, 59, 59, 999);
  };

  const currentPeriodStart = getCurrentPeriodStartDate();
  const currentPeriodEnd = getCurrentPeriodEndDate();

  const currentPeriodEntries = entries.filter((entry) => {
    const date = new Date(entry.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd;
  });

  const formatBiweeklyLabel = (periodKey: string) => {
    const startDate = new Date(periodKey);
    const startDay = startDate.getDate();
    const month = startDate.getMonth();
    const year = startDate.getFullYear();

    const start = `${String(month + 1).padStart(2, '0')}/${String(startDay).padStart(2, '0')}`;
    const endDay =
      startDay === biweeklyRange.startDay1
        ? biweeklyRange.startDay2 - 1
        : new Date(year, month + 1, 0).getDate();
    const end = `${String(month + 1).padStart(2, '0')}/${String(endDay).padStart(2, '0')}`;

    return `${start} - ${end}`;
  };

  const checkAndResetBudget = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isFirstPeriod = currentDay < biweeklyRange.startDay2;
    const resetDay = isFirstPeriod
      ? biweeklyRange.startDay1
      : biweeklyRange.startDay2;

    const currentResetKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(resetDay).padStart(2, '0')}`;

    if (lastResetDate !== currentResetKey) {
      setLastResetDate(currentResetKey);
      localStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify({
          amount: budget,
          lastResetDate: currentResetKey,
        })
      );
      return true;
    }
    return false;
  }, [biweeklyRange, lastResetDate, budget]);

  useEffect(() => {
    const savedRange = localStorage.getItem(BIWEEKLY_STORAGE_KEY);
    if (savedRange) {
      try {
        const parsed = JSON.parse(savedRange);
        if (
          typeof parsed?.startDay1 === 'number' &&
          typeof parsed?.startDay2 === 'number'
        ) {
          setBiweeklyRangeState(parsed);
        }
      } catch (e) {
        console.error('Invalid biweekly range in localStorage:', e);
      }
    }

    const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (savedBudget) {
      try {
        const parsed = JSON.parse(savedBudget);
        setBudget(parsed.amount || 4000);
        setLastResetDate(parsed.lastResetDate || '');
      } catch (e) {
        console.error('Invalid budget in localStorage:', e);
        setBudget(4000);
      }
    } else {
      setBudget(4000);
    }
  }, [setBudget]);

  useEffect(() => {
    checkAndResetBudget();
  }, [biweeklyRange, checkAndResetBudget]);

  const setBiweeklyRange = (range: BiweeklyRange) => {
    setBiweeklyRangeState(range);
    localStorage.setItem(BIWEEKLY_STORAGE_KEY, JSON.stringify(range));
    checkAndResetBudget();
  };

  const handleBudgetSave = () => {
    const newBudget = parseFloat(tempBudget) || 0;
    setBudget(newBudget);
    setIsEditingBudget(false);
    localStorage.setItem(
      BUDGET_STORAGE_KEY,
      JSON.stringify({
        amount: newBudget,
        lastResetDate: lastResetDate || '',
      })
    );
  };

  const handleBudgetCancel = () => {
    setTempBudget(budget.toString());
    setIsEditingBudget(false);
  };

  // Calculate stats
  const totalSpent = currentPeriodEntries.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const percentageUsed = (totalSpent / budget) * 100;

  const biweeklyData: Record<string, BiweeklyData> = {};
  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    let key: string;
    if (day < biweeklyRange.startDay2) {
      key = `${year}-${String(month + 1).padStart(2, '0')}-${String(biweeklyRange.startDay1).padStart(2, '0')}`;
    } else {
      key = `${year}-${String(month + 1).padStart(2, '0')}-${String(biweeklyRange.startDay2).padStart(2, '0')}`;
    }

    if (!biweeklyData[key]) {
      biweeklyData[key] = { total: 0, items: {} };
    }

    biweeklyData[key].total += entry.amount;
    const itemKey = entry.item || 'Unspecified';
    biweeklyData[key].items[itemKey] =
      (biweeklyData[key].items[itemKey] || 0) + entry.amount;
  });

  const periods = Object.entries(biweeklyData).sort(([a], [b]) =>
    a < b ? -1 : 1
  );

  const savingsPerPeriod = periods.map(([, data]) => budget - data.total);
  const averageBiweeklyExpenses =
    periods.reduce((sum, [, data]) => sum + data.total, 0) / periods.length ||
    0;
  const averageBiweeklySavings =
    savingsPerPeriod.reduce((sum, s) => sum + s, 0) /
    (savingsPerPeriod.length || 1);

  const mostExpensivePerPeriod = periods.map(([period, data]) => {
    const [item, amount] = Object.entries(data.items).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['', 0]
    );
    return { period, item, amount };
  });

  const [peakPeriodKey, peakPeriodData] = periods.reduce(
    (a, b) => (b[1].total > a[1].total ? b : a),
    ['', { total: 0, items: {} }]
  );

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-4">
      {/* Budget Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
          {!isEditingBudget && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingBudget(true)}
              className="text-muted-foreground hover:text-primary"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Budget
            </Button>
          )}
        </div>

        {isEditingBudget ? (
          <BudgetEditor
            tempBudget={tempBudget}
            setTempBudget={setTempBudget}
            handleBudgetSave={handleBudgetSave}
            handleBudgetCancel={handleBudgetCancel}
          />
        ) : (
          <div className="flex items-baseline gap-4">
            <p className="text-2xl font-bold">{formatCurrency(budget)}</p>
            <p className="text-sm text-muted-foreground">
              {entries.length > 0 ? (
                <>{Math.round(percentageUsed)}% utilized</>
              ) : (
                'No expenses yet'
              )}
            </p>
          </div>
        )}

        <ProgressBar
          totalSpent={totalSpent}
          budget={budget}
          percentageUsed={percentageUsed}
          remaining={remaining}
        />
      </div>

      <PeriodRangeSelector
        biweeklyRange={biweeklyRange}
        biweeklyPresets={biweeklyPresets}
        setBiweeklyRange={setBiweeklyRange}
      />

      {periods.length > 0 ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <BarChart className="w-4 h-4" />
              View Biweekly Spending Chart
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle>Biweekly Spending Chart</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <BiweeklySpendingChart
                periods={periods}
                formatBiweeklyLabel={formatBiweeklyLabel}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Add entries to view your biweekly spending chart.
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg Biweekly Spend"
          value={formatCurrency(averageBiweeklyExpenses)}
        />
        <StatsCard
          icon={<TrendingDown className="w-4 h-4" />}
          label="Avg Biweekly Savings"
          value={formatCurrency(averageBiweeklySavings)}
          isPositive={averageBiweeklySavings >= 0}
        />
      </div>

      {peakPeriodKey && (
        <PeakSpending
          peakPeriodKey={peakPeriodKey}
          peakPeriodData={peakPeriodData}
          budget={budget}
          formatBiweeklyLabel={formatBiweeklyLabel}
        />
      )}

      {mostExpensivePerPeriod.length > 0 && (
        <TopExpenses
          expenses={mostExpensivePerPeriod.slice(0, 2)}
          formatBiweeklyLabel={formatBiweeklyLabel}
        />
      )}
    </div>
  );
}
