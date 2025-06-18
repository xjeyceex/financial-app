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
import { useMemo } from 'react';

type BiweeklyChartDialogProps = {
  periods: [string, BiweeklyData][];
  periodBudgets: Record<string, number>;
  formatBiweeklyLabel: (key: string) => string;
  onBudgetChange: (period: string, newBudget: number) => void;
};

function isPastPeriod(periodKey: string): boolean {
  const now = new Date();
  const [year, month, day] = periodKey.split('-').map(Number);
  const periodDate = new Date(year, month - 1, day);
  return periodDate < now;
}

export default function BiweeklyChartDialog({
  periods,
  periodBudgets,
  formatBiweeklyLabel,
  onBudgetChange,
}: BiweeklyChartDialogProps) {
  const totalSavings = useMemo(() => {
    return periods.reduce((sum, [, data]) => sum + (data.savings ?? 0), 0);
  }, [periods]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <BarChart className="w-4 h-4" />
          View Biweekly Spending Chart
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[96vw] max-w-3xl max-h-[80vh] p-4 sm:p-5 lg:p-6 rounded-2xl overflow-hidden">
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

          <div className="text-right text-sm sm:text-base font-medium text-green-600">
            Total Savings: ₱{totalSavings.toFixed(2)}
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl">
            <BiweeklySpendingChart
              periods={periods}
              periodBudgets={periodBudgets}
              formatBiweeklyLabel={formatBiweeklyLabel}
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
