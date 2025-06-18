'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart } from 'lucide-react';
import SpendingChart from './SpendingChart';

// Replace BiweeklyData with a general type
type PeriodData = {
  total: number;
};

type SpendingChartDialogProps = {
  periods: [string, PeriodData][];
  periodBudgets: Record<string, number>;
  formatPeriodLabel: (key: string) => string;
  onBudgetChange: (period: string, newBudget: number) => void;
  currentPeriodKey: string;
  currentBudget: number;
};

// Determine the end of a fixed period (1–15 or 16–end of month)
function getPeriodEnd(periodKey: string): Date {
  const [year, month, day] = periodKey.split('-').map(Number);
  const isFirstHalf = day <= 15;

  const endDay = isFirstHalf ? 15 : new Date(year, month, 0).getDate(); // last day of the month

  return new Date(year, month - 1, endDay, 23, 59, 59, 999);
}

function isPastPeriod(periodKey: string): boolean {
  return new Date() > getPeriodEnd(periodKey);
}

function isCurrentPeriod(periodKey: string): boolean {
  const now = new Date();
  const [year, month, day] = periodKey.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = getPeriodEnd(periodKey);
  return now >= start && now <= end;
}

function isFuturePeriod(periodKey: string): boolean {
  const [year, month, day] = periodKey.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  return new Date() < start;
}

export default function PeriodChartDialog({
  periods,
  periodBudgets,
  formatPeriodLabel,
  onBudgetChange,
  currentPeriodKey,
  currentBudget,
}: SpendingChartDialogProps) {
  const filteredPeriods = periods.filter(
    ([periodKey, data]) =>
      data.total > 0 || periodBudgets.hasOwnProperty(periodKey)
  );

  // Inject current budget into periodBudgets (temporary override)
  const mergedBudgets = {
    ...periodBudgets,
    [currentPeriodKey]: currentBudget,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <BarChart className="w-4 h-4" />
          View Spending Chart
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[96vw] max-w-3xl h-[90vh] p-4 sm:p-5 lg:p-6 rounded-2xl overflow-hidden">
        <div className="flex flex-col h-full space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Spending Chart
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground">
              A visual breakdown of your spending and savings across periods.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto rounded-xl pr-2">
            <SpendingChart
              periods={filteredPeriods}
              periodBudgets={mergedBudgets} // ✅ use the merged version
              formatPeriodLabel={(key) => {
                const [year, month, day] = key.split('-').map(Number);
                const base = formatPeriodLabel(
                  `${year}-${String(month).padStart(2, '0')}-${day <= 15 ? '01' : '16'}`
                );
                return isCurrentPeriod(key) ? `${base}` : base;
              }}
              onBudgetChange={(period, newBudget) => {
                if (isPastPeriod(period)) {
                  onBudgetChange(period, newBudget);
                }
              }}
              disableEditFor={(periodKey) =>
                isCurrentPeriod(periodKey) || isFuturePeriod(periodKey)
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
