import { Zap } from 'lucide-react';
import { BiweeklyData } from '../../../../lib/types';

export default function PeakSpending({
  peakPeriodKey,
  peakPeriodData,
  formatBiweeklyLabel,
}: {
  peakPeriodKey: string;
  peakPeriodData: BiweeklyData;
  formatBiweeklyLabel: (key: string) => string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-xs">Peak Spending Period</span>
      </div>
      <div className="flex justify-between items-center">
        <p className="font-semibold text-sm">
          {formatBiweeklyLabel(peakPeriodKey)}
        </p>
        <p className="text-sm text-muted-foreground">
          ₱
          {peakPeriodData.total.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}
