'use client';

import { useState, useEffect, useCallback } from 'react';
import { Entry } from '../page';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Pencil, Check, X, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

type Props = {
  entries: Entry[];
  budget: number;
  setBudget: (value: number) => void;
};

type BiweeklyData = {
  total: number;
  items: Record<string, number>;
};

type ChartData = {
  period: string;
  label: string;
  total: number;
};

type BiweeklyRange = {
  startDay1: number;
  startDay2: number;
  label: string;
};

const biweeklyPresets: BiweeklyRange[] = [
  { startDay1: 1, startDay2: 16, label: '01-15' },
  { startDay1: 5, startDay2: 21, label: '05-20' },
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

  const totalSpent = currentPeriodEntries.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const percentageUsed = (totalSpent / budget) * 100;

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

  const remainingClass =
    remaining < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400';
  const remainingLabel = remaining < 0 ? 'Over Budget' : 'Remaining';

  // You can keep historical stats based on all entries (not filtered)
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

  const chartData: ChartData[] = periods.map(([period, data]) => ({
    period,
    label: formatBiweeklyLabel(period),
    total: data.total,
  }));

  return (
    <TooltipProvider>
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
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₱
                </span>
                <Input
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="pl-8 text-lg"
                  autoFocus
                  type="number"
                  min="0"
                  step="100"
                />
              </div>
              <Button size="sm" onClick={handleBudgetSave} className="h-9">
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBudgetCancel}
                className="h-9"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
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

          {lastResetDate && (
            <p className="text-xs text-muted-foreground">
              Budget period started on{' '}
              {new Date(lastResetDate).toLocaleDateString()}
            </p>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">
                {formatCurrency(totalSpent)} / {formatCurrency(budget)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  percentageUsed > 100 ? 'bg-red-500' : 'bg-blue-500'
                } transition-all duration-500`}
                style={{
                  width: `${Math.min(100, percentageUsed)}%`,
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${remainingClass}`}>
                {remainingLabel}: {formatCurrency(Math.abs(remaining))}
              </span>
              {percentageUsed > 100 && (
                <span className="text-xs text-red-500">
                  Exceeded by {formatCurrency(Math.abs(remaining))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Biweekly Range Toggle */}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="mr-2 font-medium">Biweekly Range:</span>
          {biweeklyPresets.map((range) => (
            <Button
              key={range.label}
              variant={
                biweeklyRange.label === range.label ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setBiweeklyRange(range)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Avg Biweekly Spend</span>
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(averageBiweeklyExpenses)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">Avg Biweekly Savings</span>
            </div>
            <p
              className={`text-lg font-semibold ${
                averageBiweeklySavings >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(averageBiweeklySavings)}
            </p>
          </div>
        </div>

        {/* Peak Spending Period */}
        {peakPeriodKey && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs">Peak Spending Period</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-semibold">
                  {formatBiweeklyLabel(peakPeriodKey)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(peakPeriodData.total)}
                </p>
              </div>
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
                    {Math.round((peakPeriodData.total / budget) * 100)}% of
                    budget
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {formatCurrency(peakPeriodData.total)} spent this period
                </TooltipContent>
              </UITooltip>
            </div>
          </div>
        )}

        {/* Top Expenses */}
        {mostExpensivePerPeriod.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Top Expenses
            </h4>
            {mostExpensivePerPeriod
              .slice(0, 2)
              .map(({ period, item, amount }) => (
                <div
                  key={period}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item || 'Unspecified'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBiweeklyLabel(period)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(amount)}</p>
                </div>
              ))}
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Biweekly Spending
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₱${(value as number).toLocaleString()}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      'Total Spent',
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
