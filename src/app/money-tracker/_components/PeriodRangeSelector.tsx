import { Button } from '@/components/ui/button';
import { BiweeklyRange } from './Summary';

export default function PeriodRangeSelector({
  biweeklyRange,
  biweeklyPresets,
  setBiweeklyRange,
}: {
  biweeklyRange: BiweeklyRange;
  biweeklyPresets: BiweeklyRange[];
  setBiweeklyRange: (range: BiweeklyRange) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2 text-sm text-muted-foreground">
      <span className="font-medium">Biweekly Range:</span>
      <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
