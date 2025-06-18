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
import BiweeklySpendingChart from './BiweeklySpendingChart';
import { BiweeklyData } from '../../../../lib/types';

type BiweeklyChartDialogProps = {
  periods: [string, BiweeklyData][];
  periodBudgets: Record<string, number>;
  formatBiweeklyLabel: (key: string) => string;
  onBudgetChange: (period: string, newBudget: number) => void;
};

// Determine end of biweekly period
function getPeriodEnd(periodKey: string): Date {
  const [year, month, day] = periodKey.split('-').map(Number);
  if (day === 1) {
    return new Date(year, month - 1, 15); // 1st–15th
  } else {
    const lastDay = new Date(year, month, 0).getDate(); // Last day of month
    return new Date(year, month - 1, lastDay); // 16th–end of month
  }
}

// Check if the period has ended
function isPastPeriod(periodKey: string): boolean {
  const now = new Date();
  return now > getPeriodEnd(periodKey);
}

// Check if the period is ongoing
function isCurrentPeriod(periodKey: string): boolean {
  const now = new Date();
  const [year, month, day] = periodKey.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = getPeriodEnd(periodKey);
  return now >= start && now <= end;
}

export default function BiweeklyChartDialog({
  periods,
  periodBudgets,
  formatBiweeklyLabel,
  onBudgetChange,
}: BiweeklyChartDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <BarChart className="w-4 h-4" />
          View Biweekly Spending Chart
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[96vw] max-w-3xl h-[90vh] p-4 sm:p-5 lg:p-6 rounded-2xl overflow-hidden">
        <div className="flex flex-col h-full space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Biweekly Spending Chart
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground">
              A visual breakdown of your spending and savings across biweekly
              periods.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto rounded-xl pr-2">
            <BiweeklySpendingChart
              periods={periods}
              periodBudgets={periodBudgets}
              formatBiweeklyLabel={(key) => {
                const base = formatBiweeklyLabel(key);
                return isCurrentPeriod(key) ? `${base} (Ongoing)` : base;
              }}
              onBudgetChange={(period, newBudget) => {
                if (isPastPeriod(period)) {
                  onBudgetChange(period, newBudget);
                }
              }}
              disableEditFor={(periodKey) => !isPastPeriod(periodKey)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
