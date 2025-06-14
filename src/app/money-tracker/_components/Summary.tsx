'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  TrendingUp,
  TrendingDown,
  BarChart,
  History,
} from 'lucide-react';
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
import { DialogDescription } from '@radix-ui/react-dialog';
import { BiweeklyData, BiweeklyRange, Entry } from '../../../../lib/types';

type Props = {
  entries: Entry[];
  budget: number;
  setBudget: (value: number) => void;
};

interface BudgetStorage {
  currentBudget: number;
  periodBudgets: Record<string, number>;
  lastResetDate: string;
}

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
  const [showBudgetHistory, setShowBudgetHistory] = useState(false);
  const [periodBudgets, setPeriodBudgets] = useState<Record<string, number>>(
    {}
  );

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

  function handleBudgetChange(period: string, newBudget: number) {
    setPeriodBudgets((prev) => ({
      ...prev,
      [period]: newBudget,
    }));
  }

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
    const [year, month, day] = periodKey.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const startDay = startDate.getDate();
    const monthName = startDate.toLocaleString('default', { month: 'short' });

    const endDay =
      startDay === biweeklyRange.startDay1
        ? biweeklyRange.startDay2 - 1
        : new Date(year, month, 0).getDate();

    return `${monthName} ${startDay}-${endDay}`;
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
    const currentResetKey = getCurrentPeriodKey();

    if (lastResetDate !== currentResetKey) {
      let budgetData: BudgetStorage = {
        currentBudget: budget,
        periodBudgets: {},
        lastResetDate: currentResetKey,
      };

      const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);

      if (savedBudget) {
        try {
          const parsedData = JSON.parse(savedBudget);
          if (parsedData && typeof parsedData === 'object') {
            budgetData = {
              currentBudget: parsedData.currentBudget || budget,
              periodBudgets: parsedData.periodBudgets || {},
              lastResetDate: currentResetKey,
            };
          }
        } catch (error) {
          console.error('Error parsing budget data:', error);
        }
      }

      if (!budgetData.periodBudgets[currentResetKey]) {
        budgetData.periodBudgets[currentResetKey] = budgetData.currentBudget;
      }

      const newBudget = budgetData.periodBudgets[currentResetKey];
      setPeriodBudgets(budgetData.periodBudgets);
      setBudget(newBudget);

      budgetData.currentBudget = newBudget;
      budgetData.lastResetDate = currentResetKey;
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetData));

      setLastResetDate(currentResetKey);
      return true;
    }

    return false;
  }, [getCurrentPeriodKey, lastResetDate, budget, setBudget]);

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
        const parsed: BudgetStorage = JSON.parse(savedBudget);
        setBudget(parsed.currentBudget || 4000);
        setLastResetDate(parsed.lastResetDate || '');
        setPeriodBudgets(parsed.periodBudgets || {});
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

    const currentResetKey = getCurrentPeriodKey();

    // Update budget storage
    const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
    let budgetData: BudgetStorage = {
      currentBudget: newBudget,
      periodBudgets: {},
      lastResetDate: currentResetKey,
    };

    if (savedBudget) {
      try {
        budgetData = JSON.parse(savedBudget);
      } catch (e) {
        console.error('Invalid budget data in localStorage:', e);
      }
    }

    // Update the budget for this period
    budgetData.currentBudget = newBudget;
    budgetData.periodBudgets[currentResetKey] = newBudget;
    budgetData.lastResetDate = currentResetKey;

    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetData));
    setLastResetDate(currentResetKey);
    setPeriodBudgets(budgetData.periodBudgets);
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
      // Get the budget for this period if it exists
      const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
      let periodBudget = budget; // Default to current budget
      if (savedBudget) {
        try {
          const budgetData: BudgetStorage = JSON.parse(savedBudget);
          periodBudget =
            budgetData.periodBudgets[key] || budgetData.currentBudget;
        } catch (e) {
          console.error('Error parsing budget data:', e);
        }
      }

      biweeklyData[key] = {
        total: 0,
        budget: periodBudget,
        savings: periodBudget,
        items: {},
      };
    }

    biweeklyData[key].total += entry.amount;
    biweeklyData[key].savings =
      biweeklyData[key].budget - biweeklyData[key].total;

    const itemKey = entry.item || 'Unspecified';
    biweeklyData[key].items[itemKey] =
      (biweeklyData[key].items[itemKey] || 0) + entry.amount;
  });

  const periods = Object.entries(biweeklyData).sort(([a], [b]) =>
    a < b ? -1 : 1
  );

  const savingsPerPeriod = periods.map(([, data]) => data.savings);
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
    ['', { total: 0, items: {}, budget: 0, savings: 0 }]
  );

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-4">
      {/* Budget Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {isEditingBudget ? (
          <BudgetEditor
            tempBudget={tempBudget}
            setTempBudget={setTempBudget}
            handleBudgetSave={handleBudgetSave}
            handleBudgetCancel={handleBudgetCancel}
          />
        ) : (
          <div className="flex items-center gap-2 min-w-fit md:flex-shrink-0">
            <button
              onClick={() => setIsEditingBudget(true)}
              className="flex items-center text-left rounded-lg p-1 transition hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">{formatCurrency(budget)}</p>
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
            <button
              onClick={() => setShowBudgetHistory(true)}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Budget history"
            >
              <History className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-[1px]">
              {entries.length > 0 ? (
                <>{Math.round(percentageUsed)}% utilized</>
              ) : (
                'No expenses yet'
              )}
            </p>
          </div>
        )}

        <div className="flex-1 w-full">
          <ProgressBar
            totalSpent={totalSpent}
            budget={budget}
            percentageUsed={percentageUsed}
            remaining={remaining}
          />
        </div>
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
          <DialogContent
            className="w-[96vw] max-w-3xl max-h-[80vh] p-4 sm:p-5 lg:p-6 rounded-2xl overflow-hidden"
            style={{ maxWidth: '50rem' }}
          >
            <div className="flex flex-col h-full space-y-6">
              {/* Header */}
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                  Biweekly Spending Chart
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                  A visual breakdown of your spending and savings across
                  biweekly periods.
                </DialogDescription>
              </DialogHeader>

              {/* Chart Area */}
              <div className="flex-1 overflow-y-auto rounded-xl ">
                <BiweeklySpendingChart
                  periods={periods}
                  periodBudgets={periodBudgets}
                  formatBiweeklyLabel={formatBiweeklyLabel}
                  onBudgetChange={handleBudgetChange}
                />
              </div>
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

      {/* Budget History Dialog */}
      <Dialog open={showBudgetHistory} onOpenChange={setShowBudgetHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget History</DialogTitle>
            <DialogDescription>
              Your budget settings for previous periods
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {Object.entries(periodBudgets).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(periodBudgets)
                  .sort(([a], [b]) => (a > b ? -1 : 1))
                  .map(([period, budget]) => (
                    <div
                      key={period}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <span className="font-medium">
                        {formatBiweeklyLabel(period)}
                      </span>
                      <span>{formatCurrency(budget)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No budget history available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
