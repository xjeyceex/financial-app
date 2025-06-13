import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Zap } from 'lucide-react';
import { BiweeklyData } from './Summary';

export default function PeakSpending({
  peakPeriodKey,
  peakPeriodData,
  budget,
  formatBiweeklyLabel,
}: {
  peakPeriodKey: string;
  peakPeriodData: BiweeklyData;
  budget: number;
  formatBiweeklyLabel: (key: string) => string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-xs">Peak Spending Period</span>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="font-semibold">{formatBiweeklyLabel(peakPeriodKey)}</p>
          <p className="text-sm text-muted-foreground">
            ₱
            {peakPeriodData.total.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <UITooltip>
          <TooltipTrigger asChild>
            <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
              {Math.round((peakPeriodData.total / budget) * 100)}% of budget
            </span>
          </TooltipTrigger>
          <TooltipContent>
            ₱
            {peakPeriodData.total.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
            })}{' '}
            spent this period
          </TooltipContent>
        </UITooltip>
      </div>
    </div>
  );
}
