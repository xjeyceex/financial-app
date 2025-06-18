'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import StatsCard from './StatsCard'; // assumed location
import { formatCurrency } from '../../../../lib/functions';

type StatsGridProps = {
  averageBiweeklyExpenses: number;
  averageBiweeklySavings: number;
};

export default function StatsGrid({
  averageBiweeklyExpenses,
  averageBiweeklySavings,
}: StatsGridProps) {
  return (
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
  );
}
