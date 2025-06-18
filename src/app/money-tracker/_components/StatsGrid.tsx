'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import StatsCard from './StatsCard';
import { formatCurrency } from '../../../../lib/functions';

type StatsGridProps = {
  totalDebt: number;
  totalSavings: number;
};

export default function StatsGrid({ totalDebt, totalSavings }: StatsGridProps) {
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
    </div>
  );
}
