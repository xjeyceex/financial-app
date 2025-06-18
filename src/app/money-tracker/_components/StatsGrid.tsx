'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import StatsCard from './StatsCard';
import { formatCurrency } from '../../../../lib/functions';
import { Button } from '@/components/ui/button';

type StatsGridProps = {
  totalDebt: number;
  totalSavings: number;
  onPayDebt?: (amount: number) => void;
};

export default function StatsGrid({
  totalDebt,
  totalSavings,
  onPayDebt,
}: StatsGridProps) {
  const canPayDebt = totalDebt > 0 && totalSavings > 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatsCard
        icon={<TrendingDown className="w-4 h-4" />}
        label="Total Debt"
        value={formatCurrency(totalDebt)}
        isPositive={false}
      />
      <StatsCard
        icon={<TrendingUp className="w-4 h-4" />}
        label="Total Savings"
        value={formatCurrency(totalSavings)}
        isPositive={totalSavings >= 0}
      />

      {canPayDebt && onPayDebt && (
        <div className="col-span-2">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground text-center">
              You can pay {formatCurrency(Math.min(totalDebt, totalSavings))} of
              your debt
            </div>
            <div className="flex items-center justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPayDebt(Math.min(totalDebt, totalSavings))}
              >
                Pay Full Amount
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
